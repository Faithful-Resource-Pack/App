<template>
	<v-container>
		<div class="styles" v-html="pageStyles" />
		<user-modal
			:color="pageColor"
			v-model="dialogOpen"
			@close="closeUserModal"
			:add="dialogDataAdd"
			:data="dialogData"
			:roles="roles"
		/>
		<user-remove-confirm
			v-model="remove.confirm"
			@close="
				() => {
					remove.confirm = false;
					update();
				}
			"
			:data="remove.data"
		/>

		<div class="text-h4 py-4">
			{{ $root.lang().database.titles.users }}
		</div>

		<!-- role switcher -->
		<div class="my-2 text-h5">{{ $root.lang().database.subtitles.select_user_role }}</div>
		<div class="selector">
			<v-btn
				v-for="role in usersRoles"
				:key="role"
				:class="['my-1 mr-2', activeRole(role)]"
				:to="userURL(role)"
				:exact="role == 'all'"
			>
				{{ role }}
			</v-btn>
		</div>

		<!-- search -->
		<div class="my-2 text-h5">{{ $root.lang().database.subtitles.search }}</div>
		<div class="my-2">
			<v-text-field
				v-model="search"
				append-outer-icon="mdi-send"
				filled
				clear-icon="mdi-close"
				clearable
				:placeholder="$root.lang().database.labels.search_username"
				type="text"
				hide-details
				:color="pageColor"
				@keyup.enter="startSearch"
				@click:append-outer="startSearch"
				@click:clear="clearSearch"
			/>
		</div>

		<!-- main buttons -->
		<v-btn block @click="openDialog()" :color="pageColor" :class="[textColorOnPage, 'my-6']">
			{{ $root.lang().database.labels.add_new_user }}<v-icon right dark>mdi-plus</v-icon>
		</v-btn>

		<!-- results -->
		<div class="my-2 text-h5">{{ $root.lang().database.subtitles.user_result }}</div>
		<div v-if="loading" class="text-center">
			<v-progress-circular indeterminate :color="pageColor" />
		</div>
		<v-list rounded v-else-if="users.length" two-line class="main-container">
			<v-row>
				<v-col :cols="12 / listColumns" xs="1" v-for="(users, index) in splitUsers" :key="index">
					<v-list-item v-for="user in users" :key="user.id">
						<v-list-item-avatar tile class="database-list-avatar">
							<v-img v-if="user.uuid" :src="`https://visage.surgeplay.com/head/48/${user.uuid}`" />
							<v-icon large v-else style="background: rgba(39, 39, 39, 0.8)">mdi-account</v-icon>
						</v-list-item-avatar>

						<v-list-item-content>
							<v-list-item-title>{{ user.username }}</v-list-item-title>

							<v-list-item-subtitle>{{ (user.roles || []).join(", ") }}</v-list-item-subtitle>
						</v-list-item-content>

						<!-- action buttons -->
						<v-list-item-action class="merged">
							<v-btn icon @click="openDialog(user)">
								<v-icon color="lighten-1">mdi-pencil</v-icon>
							</v-btn>
							<v-btn icon @click="askRemove(user)">
								<v-icon color="red lighten-1">mdi-delete</v-icon>
							</v-btn>
						</v-list-item-action>
					</v-list-item>
				</v-col>
			</v-row>

			<v-btn
				:style="{ margin: 'auto', 'min-width': '250px !important' }"
				:disabled="displayedResults >= Object.keys(users).length"
				:color="pageColor"
				:class="[textColorOnPage, 'mb-4']"
				block
				@click="showMore()"
				v-if="displayedResults < Object.keys(users).length"
				elevation="2"
			>
				{{ $root.lang().global.btn.load_more }}
			</v-btn>
		</v-list>
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

export default {
	name: "users-page",
	components: {
		UserModal,
		UserRemoveConfirm,
	},
	data() {
		const INCREMENT = 250;

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
			dialogOpen: false,
			dialogData: {},
			dialogDataAdd: false,
			remove: {
				confirm: false,
				data: {},
			},
			displayedResults: INCREMENT,
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
		showMore() {
			this.displayedResults += 100;
			this.update(false);
		},
		clearSearch() {
			this.search = "";
			this.startSearch();
		},
		openDialog(data = undefined) {
			this.dialogData = data;
			this.dialogDataAdd = data === undefined;
			this.dialogOpen = true;
		},
		closeUserModal(refresh = false) {
			this.dialogOpen = false;
			this.dialogData = {};
			this.dialogDataAdd = false;

			if (refresh) this.update();
		},
		askRemove(data) {
			this.remove.data = data;
			this.remove.confirm = true;
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
		listColumns() {
			let columns = 1;

			if (this.$vuetify.breakpoint.mdAndUp && this.displayedResults >= 6) {
				columns = 2;
				if (this.$vuetify.breakpoint.lgAndUp && this.displayedResults >= 21) {
					columns = 3;
				}
			}

			return columns;
		},
		splitUsers() {
			const res = [];

			const keys = Object.keys(this.users);
			const len = keys.length;

			for (let col = 0; col < this.listColumns; ++col) res.push([]);

			let arrayIndex = 0;
			for (let i = 0; i < Math.min(this.displayedResults, len); i++) {
				res[arrayIndex].push(this.users[keys[i]]);
				arrayIndex = (arrayIndex + 1) % this.listColumns;
			}

			return res;
		},
	},
	mounted() {
		this.getRoles();
		window.updatePageStyles(this);
	},
};
</script>
