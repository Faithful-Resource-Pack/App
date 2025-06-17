<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<user-modal
			v-model="modalOpen"
			:color="pageColor"
			:add="modalAdd"
			:data="modalData"
			:roles="roles"
			@close="closeUserModal"
		/>
		<user-remove-confirm v-model="remove.open" :data="remove.data" @close="update" />

		<div class="text-h4 py-4">
			{{ $root.lang().database.users.title }}
		</div>

		<!-- role switcher -->
		<div class="my-2 text-h5">{{ $root.lang().database.users.role_filter }}</div>
		<div class="selector">
			<v-btn
				v-for="userRole in usersRoles"
				:key="userRole"
				:class="['my-1 mr-2', activeRole(userRole)]"
				:to="userURL(userRole)"
				:exact="userRole == 'all'"
			>
				{{ userRole }}
			</v-btn>
		</div>

		<!-- search -->
		<div class="my-2 text-h5">{{ $root.lang().database.search }}</div>
		<div class="my-2">
			<search-box
				v-model="search"
				:color="pageColor"
				:placeholder="$root.lang().database.users.search_username"
				@search="startSearch"
				@clear="clearSearch"
			/>
		</div>

		<!-- main buttons -->
		<v-btn block :color="pageColor" :class="[textColorOnPage, 'my-6']" @click="openModal()">
			{{ $root.lang().database.users.modal.add_user }}<v-icon right dark>mdi-plus</v-icon>
		</v-btn>

		<!-- results -->
		<div class="my-2 text-h5">{{ $root.lang().database.users.user_result }}</div>
		<div v-if="loading" class="text-center">
			<v-progress-circular indeterminate :color="pageColor" />
		</div>
		<smart-grid
			v-else-if="users.length"
			:items="users"
			:pageColor="pageColor"
			:textColor="textColorOnPage"
			track="id"
		>
			<template #default="{ item }">
				<v-list-item-avatar tile class="database-list-avatar">
					<v-img v-if="item.uuid" :src="`https://visage.surgeplay.com/head/48/${item.uuid}`" />
					<v-icon v-else large class="darken-1">mdi-account</v-icon>
				</v-list-item-avatar>

				<v-list-item-content>
					<v-list-item-title>{{ item.username }}</v-list-item-title>
					<v-list-item-subtitle>{{ (item.roles || []).join(", ") }}</v-list-item-subtitle>
				</v-list-item-content>

				<!-- action buttons -->
				<v-list-item-action class="merged">
					<v-btn icon @click="openModal(item)">
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn icon @click="askRemove(item)">
						<v-icon color="red lighten-1">mdi-delete</v-icon>
					</v-btn>
				</v-list-item-action>
			</template>
		</smart-grid>
		<div v-else>
			<br />
			<i>{{ $root.lang().global.no_results }}</i>
		</div>
	</v-container>
</template>

<script>
import axios from "axios";

import UserModal from "./user-modal.vue";
import UserRemoveConfirm from "./user-remove-confirm.vue";
import SmartGrid from "@components/smart-grid.vue";
import SearchBox from "@components/search-box.vue";

import { updatePageStyles } from "@helpers/colors.js";

export default {
	name: "users-page",
	components: {
		SmartGrid,
		SearchBox,
		UserModal,
		UserRemoveConfirm,
	},
	data() {
		return {
			pageColor: "indigo accent-2",
			textColorOnPage: "white--text",
			pageStyles: "",
			recompute: false,
			roles: [],
			search: "",
			searchPromise: undefined,
			users: [],
			loading: false,
			modalOpen: false,
			modalData: {},
			modalAdd: false,
			remove: {
				open: false,
				data: {},
			},
		};
	},
	methods: {
		activeRole(t) {
			const result = {};
			result[`v-btn--active ${this.pageColor} ${this.textColorOnPage}`] =
				(t === "all" && !this.role && !!this.name) ||
				(t && this.role && t.toLowerCase() === this.role.toLowerCase());

			return result;
		},
		userURL(t) {
			return `/users/${t}/${this.name || ""}`;
		},
		startSearch() {
			// /whatever/ => /whatever/<search>
			// /whatever/<oldSearch> => /whatever/<search>
			// /whatever/<role> =>/whatever/<role>/<search>
			// /whatever/<role>/<name> => /whatever/<role>/<search>
			let newPath;
			if (this.name) {
				const split = this.$route.path.split("/");
				split.pop();
				newPath = split.join("/");
			} else {
				newPath = this.$route.path;
			}

			if (!newPath.endsWith("/")) newPath += "/";
			if (this.search) newPath += this.search;
			if (newPath !== this.$route.path) {
				this.$router.push(newPath).catch(() => {});
			}
			this.getUsers();
		},
		getRoles() {
			axios
				.get(`${this.$root.apiURL}/users/roles`)
				.then((response) => {
					this.roles = response.data;
				})
				.catch((error) => {
					console.error(error);
				})
				.finally(() => {
					this.$nextTick(() => {
						this.search = this.name;
					});
				});
		},
		getUsers() {
			this.loading = true;
			const url = `${this.$root.apiURL}${this.$route.path
				.split("/")
				.map((str) => (str === "users" ? "users/role" : str))
				.join("/")}`;
			axios
				.get(url, this.$root.apiOptions)
				.then((res) => {
					this.users = res.data;
				})
				.catch((err) => console.error(err))
				.finally(() => {
					this.loading = false;
				});
		},
		update(users = true) {
			this.getRoles();
			if (users) this.getUsers();
		},
		clearSearch() {
			this.search = "";
			this.startSearch();
		},
		openModal(data = undefined) {
			this.modalData = data;
			this.modalAdd = data === undefined;
			this.modalOpen = true;
		},
		closeUserModal(refresh = false) {
			this.modalData = {};
			this.modalAdd = false;

			if (refresh) this.update();
		},
		askRemove(data) {
			this.remove.data = data;
			this.remove.open = true;
		},
	},
	computed: {
		usersRoles() {
			return ["all", ...this.roles];
		},
		role() {
			if (this.$route.params.role && this.usersRoles.includes(this.$route.params.role))
				return this.$route.params.role;
			return undefined;
		},
		name() {
			if (this.role !== undefined) return this.$route.params.name;
			return this.$route.params.role;
		},
	},
	mounted() {
		this.getRoles();
		updatePageStyles(this);
	},
};
</script>
