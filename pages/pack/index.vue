<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<pack-modal
			v-model="modalOpen"
			:color="pageColor"
			:data="modalData"
			:add="modalAdd"
			:tags="tags"
			@close="close"
		/>
		<pack-remove-confirm
			v-model="remove.open"
			:packID="remove.id"
			type="packs"
			:label="remove.label"
			@close="startSearch"
		/>

		<v-row no-gutters class="py-0 mb-0" align="center">
			<v-col cols="12" sm="6">
				<div class="text-h4 py-4">
					{{ $root.lang().database.packs.title }}
				</div>
			</v-col>
			<v-col cols="12" sm="6">
				<v-btn block :color="pageColor" @click="openModal()">
					{{ $root.lang().database.packs.modal.add_pack }}<v-icon right dark>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>

		<!-- tag switcher -->
		<div class="my-2 text-h5">{{ $root.lang().database.packs.tag_filter }}</div>
		<div class="selector">
			<v-btn
				v-for="packTag in packTags"
				:key="packTag"
				:class="['my-1 mr-2', activeTag(packTag)]"
				:to="packURL(packTag)"
				:exact="packTag == 'all'"
			>
				{{ formatTags(packTag) }}
			</v-btn>
		</div>

		<!-- results -->
		<div class="my-2 text-h5">{{ $root.lang().database.packs.pack_result }}</div>
		<smart-grid
			v-if="packs.length"
			:items="packs"
			:pageColor="pageColor"
			:textColor="textColorOnPage"
			:maxColumns="2"
			track="id"
		>
			<template #default="{ item }">
				<!-- for some reason .database-list-avatar isn't working here -->
				<v-list-item-avatar
					:style="{
						height: '64px',
						width: '64px',
						'min-width': '64px',
						'border-radius': '5px',
					}"
				>
					<v-img :src="item.logo" />
				</v-list-item-avatar>
				<v-list-item-content>
					<v-list-item-title>{{ item.name }}</v-list-item-title>
					<v-list-item-subtitle>
						{{ (item.tags.map(formatTags) || []).join(", ") }}
					</v-list-item-subtitle>
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
		<div v-else class="text-center">
			<v-progress-circular indeterminate :color="pageColor" />
		</div>
	</v-container>
</template>

<script>
import axios from "axios";

import SmartGrid from "@components/smart-grid.vue";

import PackModal from "./pack-modal.vue";
import PackRemoveConfirm from "./pack-remove-confirm.vue";

import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "pack-page",
	components: {
		SmartGrid,
		PackModal,
		PackRemoveConfirm,
	},
	data() {
		return {
			pageColor: "purple lighten-1",
			pageStyles: "",
			search: "",
			textColorOnPage: "white--text",
			tags: [],
			packs: [],
			modalOpen: false,
			modalData: {},
			modalAdd: false,
			remove: {
				id: "",
				label: "",
				open: false,
			},
		};
	},
	methods: {
		activeTag(t) {
			const result = {};
			result[`v-btn--active ${this.pageColor} ${this.textColorOnPage}`] =
				(t === "all" && !this.tag) || (t && this.tag && t.toLowerCase() === this.tag.toLowerCase());

			return result;
		},
		startSearch() {
			// change url to match
			const newPath = this.packURL(this.tag);
			if (newPath !== this.$route.path) return this.$router.push(newPath);

			// "all" tag searches everything
			const url = new URL(`${this.$root.apiURL}/packs/search`);
			if (this.tags.includes(this.$route.params.tag))
				url.searchParams.set("tag", this.$route.params.tag);

			axios
				.get(url.toString())
				.then((res) => {
					this.packs = res.data;
				})
				.catch((err) => console.error(err));
		},
		packURL(tag) {
			return `/packs/${tag || "all"}`;
		},
		formatTags(s) {
			return s
				.split("_")
				.map((p) => (p == "progart" ? "Programmer Art" : p.toTitleCase()))
				.join(" ");
		},
		openModal(data) {
			this.modalOpen = true;
			this.modalData = data || {};
			this.modalAdd = data === undefined;
		},
		close(refresh = false) {
			this.modalOpen = false;
			// clear form
			this.modalData = {};
			if (refresh) this.startSearch();
		},
		askRemove(data) {
			this.remove.id = data.id;
			this.remove.label = this.$root
				.lang()
				.database.ask_deletion.replace("%s", data.name)
				.replace("%d", data.id);
			this.remove.open = true;
		},
	},
	computed: {
		packTags() {
			return ["all", ...this.tags];
		},
		tag() {
			return this.$route.params.tag || "all";
		},
	},
	mounted() {
		axios.get(`${this.$root.apiURL}/packs/tags`).then((res) => (this.tags = res.data));
		this.startSearch();
		this.pageStyles = generatePageStyles(this, this.pageColor);
	},
	watch: {
		"$route.params": {
			handler(params, old) {
				// if hash changed but not params
				if (JSON.stringify(params) === JSON.stringify(old)) return;

				// search whenever the url changes (when tag is switched)
				this.startSearch();
			},
		},
	},
};
</script>
