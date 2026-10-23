<template>
	<v-container>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />

		<reason-modal
			v-model="reasonModalOpen"
			:type="reasonType"
			:color="pageColor"
			@close="closeReasonModal"
		/>

		<div class="d-flex flex-wrap align-center justify-space-between my-4 ga-4">
			<h1 class="text-h4">{{ $root.lang().review.titles.addons }}</h1>
			<v-btn
				color="secondary"
				href="https://faithfulpack.net/addons"
				target="_blank"
				rel="noopener noreferrer"
			>
				<v-icon left>mdi-open-in-new</v-icon>
				{{ $root.lang().review.labels.public_page }}
			</v-btn>
		</div>

		<review-categories v-model="status" :activeColor="pageColor" :categories="categories" />
		<div
			class="review-content-container my-2"
			:style="$vuetify.breakpoint.mdAndUp && 'height: 70vh'"
		>
			<!-- empty layout is shared across both mobile and desktop -->
			<v-card v-if="!selectedListItems.length" class="main-container text-center px-4 py-8">
				<loading-page v-if="loading" />
				<ascii-error v-else :subtitle="$root.lang().review.labels[status]" />
			</v-card>
			<div v-else-if="$vuetify.breakpoint.mdAndUp" class="d-flex ga-2">
				<review-list
					v-model="selectedAddonId"
					:items="selectedListItems"
					:activeColor="pageColor"
					style="width: 256px"
				/>
				<!-- no v-model since you can't change the active addon from the preview alone -->
				<review-preview
					style="width: calc(100% - 256px)"
					:addon="selectedAddon"
					:status="status"
					:authors="authors"
					@review="changeStatus"
				/>
			</div>
			<mobile-reviewer
				v-else
				:addon="selectedAddon"
				:items="selectedListItems"
				:status="status"
				:authors="authors"
				@review="changeStatus"
			/>
		</div>
	</v-container>
</template>

<script>
import axios from "axios";

import AsciiError from "@components/ascii-error.vue";
import LoadingPage from "@layouts/loading-page.vue";

import ReasonModal from "./reason-modal.vue";

import ReviewCategories from "./review-categories.vue";
import ReviewList from "./review-list.vue";
import ReviewPreview from "./review-preview.vue";
import MobileReviewer from "./mobile-reviewer.vue";

import { generatePageStyles } from "@helpers/colors.js";

const searchMixin = {
	methods: {
		/**
		 * Gets a specific param
		 * @param {string} name Search param name
		 * @returns {String|null} param value
		 */
		searchGet(name) {
			return this.$route.query[name];
		},
		/**
		 * Updates search param with new
		 * @param {string} name Search param name
		 * @param {any} value given value
		 */
		searchSet(name, value) {
			if (this.$route.query[name] === value) return;
			this.$router.push({ query: { ...this.$route.query, [name]: String(value) } });
		},
		searchDelete(name) {
			const query = { ...this.$route.query };
			if (query[name] === undefined) return;
			delete query[name];
			this.$router.push({ query });
		},
	},
};

export default {
	name: "addon-review-page",
	components: {
		AsciiError,
		LoadingPage,
		MobileReviewer,
		ReasonModal,
		ReviewCategories,
		ReviewList,
		ReviewPreview,
	},
	mixins: [searchMixin],
	data() {
		return {
			pageColor: "yellow darken-3",
			pageStyles: "",
			textColorOnPage: "white--text",
			colors: {
				approved: "green",
				pending: "yellow",
				denied: "red",
				archived: "grey",
			},
			addons: {
				pending: [],
				approved: [],
				denied: [],
				archived: [],
			},
			loading: true,
			authors: [],
			packs: {},
			reasonModalOpen: false,
			reasonModalId: {},
			reasonType: "denied",
			status: "pending",
			selectedAddonId: undefined,
		};
	},
	methods: {
		changeStatus(id, status) {
			// cool trick to reuse the same event when deleting addons
			if (status === "deleted") return this.reloadAddons();

			switch (status) {
				case "approved":
					return this.reviewAddon(id, status);
				// both go through the same popup
				case "denied":
				case "archived":
					return this.openReasonModal(id, status);
			}
		},
		reviewAddon(id, status = "approved", reason = null) {
			if (!this.$root.isLoggedIn) return;

			const data = { status, reason };
			this.$root
				.wrapSnackbar(
					axios.put(`${this.$root.apiURL}/addons/${id}/review`, data, this.$root.apiOptions),
				)
				.then(() => this.reloadAddons());
		},
		openReasonModal(addon, reasonType = "denied") {
			this.reasonType = reasonType;
			this.reasonModalOpen = true;
			this.reasonModalId = addon;
		},
		closeReasonModal(success = false, reason) {
			if (success) this.reviewAddon(this.reasonModalId, this.reasonType, reason);
		},
		reloadAddons() {
			this.loading = true;
			// focused addon is no longer in the same status list so remove the param and reload
			this.searchDelete("id");
			this.getAddons();
		},
		async getAddons() {
			const res = await axios.get(`${this.$root.apiURL}/addons/raw`, this.$root.apiOptions);
			const addons = Object.values(res.data).sort((a, b) => {
				if (a.last_updated && b.last_updated) return b.last_updated - a.last_updated;

				// if there's An Update Date it's automatically newer
				if (a.last_updated) return -1;
				if (b.last_updated) return 1;

				// no info to go off, just compare ids
				return b.id - a.id;
			});

			for (const status of Object.keys(this.addons))
				this.addons[status] = addons.filter((f) => f.approval.status === status);

			this.loading = false;
			this.updateSearch();
		},
		getAuthors() {
			axios.get(`${this.$root.apiURL}/users/names`).then((res) => {
				this.authors = res.data;
			});
		},
		getPacks() {
			axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
				this.packs = res.data;
			});
		},
		updateSearch() {
			this.status = this.searchGet("status") || this.status;
			this.$nextTick(() => {
				this.selectedAddonId =
					this.searchGet("id") || this.addons[this.status][0]?.id || this.selectedAddonId;
			});
		},
	},
	computed: {
		stats() {
			return Object.values(this.addons).map((v) => v.length);
		},
		categories() {
			return Object.keys(this.addons).map((cat, i) => ({
				label: this.$root.lang().review.titles[cat],
				color: this.colors[cat],
				value: cat,
				count: this.stats[i] !== undefined ? String(this.stats[i]) : "",
			}));
		},
		allListItems() {
			return Object.entries(this.addons)
				.map(([category, addons]) => ({
					category,
					items: addons.map((a) => ({
						key: String(a.id),
						primary: a.name,
						secondary: a.options.packs.map((p) => this.packs[p]?.name || p).join(", "),
					})),
				}))
				.reduce((acc, cur) => {
					acc[cur.category] = cur.items;
					return acc;
				}, {});
		},
		selectedListItems() {
			return this.allListItems[this.status];
		},
		selectedAddon() {
			return this.addons[this.status].find((a) => a.id === this.selectedAddonId);
		},
	},
	watch: {
		status: {
			handler(n) {
				// select first if not empty
				const matchingAddons = this.addons[n];
				this.selectedAddonId = matchingAddons.length ? matchingAddons[0].id : undefined;
			},
			immediate: true,
		},
		"$route.query": {
			handler(params, prev) {
				if (JSON.stringify(params) === JSON.stringify(prev)) return;
				this.updateSearch();
			},
			deep: true,
			immediate: true,
		},
	},
	created() {
		this.updateSearch();
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);

		Promise.all([this.getAuthors(), this.getPacks(), this.getAddons()]).catch((err) => {
			console.error(err);
			this.$root.showSnackbar(err, "error");
		});
	},
};
</script>

<style lang="scss">
// make sure all children take up the same space
.review-content-container > * {
	width: 100%;
	height: 100%;
}

// white text on yellow background is completely illegible
.theme--dark .yellow.darken-3,
.theme--dark .yellow.darken-3 .v-list-item__title {
	color: rgba(0, 0, 0, 0.87);
}
.theme--dark .yellow.darken-3 .v-list-item__subtitle {
	color: rgba(0, 0, 0, 0.6);
}
</style>
