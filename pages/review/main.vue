<template>
	<v-container id="review-addons">
		<div class="styles" v-html="pageStyles" />
		<div class="text-h4 py-4">
			{{ $root.lang().review.titles.addons }}
		</div>

		<deny-popup v-model="showDenyPopup" @close="closeDenyPopup" />

		<review-categories
			:categories="categories"
			v-model="status"
			:activeColor="pageColor"
			:empty="empty"
		/>

		<div id="review-content" :class="['mt-1 mb-2', { desktop: $vuetify.breakpoint.mdAndUp }]">
			<div v-if="selectedItems.length === 0" id="empty">
				<div class="rounded-lg d-flex text-center align-center justify-center">
					<div>
						<pre v-if="$vuetify.breakpoint.mdAndUp">
    d8888   .d8888b.      d8888
   d8P888  d88P  Y88b    d8P888
  d8P 888  888    888   d8P 888
 d8P  888  888    888  d8P  888
d88   888  888    888 d88   888
8888888888 888    888 8888888888
      888  Y88b  d88P       888
      888   "Y8888P"        888
</pre
						>
						<p v-else class="text-h2 my-2">404</p>
						<p class="my-2 px-2">{{ empty }}</p>
					</div>
				</div>
			</div>
			<template v-if="selectedItems && selectedItems.length > 0">
				<template v-if="$vuetify.breakpoint.mdAndUp">
					<div id="review-list">
						<review-list
							:items="selectedItems"
							v-model="selectedAddonId"
							:activeColor="pageColor"
							:empty="empty"
						/>
					</div>
					<div id="review-previewer">
						<review-preview :addonId="selectedAddonId" color="#9575cd" />
					</div>
				</template>
				<template v-else>
					<v-expansion-panels v-if="addons[status].length > 0" style="margin-top: 5px">
						<expansion-panel
							v-model="selectedAddonId"
							:contributors="contributors"
							:color="pageColor"
							:addons="addons[status]"
							:reviewAddon="reviewAddon"
							:openDenyPopup="openDenyPopup"
							:update="update"
							:status="status"
						/>
					</v-expansion-panels>
					<template v-else-if="loading[status] === true">
						<v-container>{{ $root.lang().global.loading }}</v-container>
					</template>
					<template v-else>
						<v-container>{{ $root.lang().review.labels[status] }}</v-container>
					</template>
				</template>
			</template>
		</div>
	</v-container>
</template>

<script>
import axios from "axios";

import ExpansionPanel from "./expansion-panel.vue";
import DenyPopup from "./deny-popup.vue";
import ReviewCategories from "./review-categories.vue";
import ReviewList from "./review-list.vue";
import ReviewPreview from "./review-previewer.vue";

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
			delete query[name];
			this.$router.push({ query });
		},
	},
};

export default {
	name: "review-addons-page",
	components: {
		ExpansionPanel,
		DenyPopup,
		ReviewCategories,
		ReviewList,
		ReviewPreview,
	},
	mixins: [searchMixin],
	data() {
		return {
			pageColor: "deep-purple lighten-2",
			pageStyles: "",
			textColorOnPage: "white--text",
			colors: {
				pending: "yellow",
				denied: "red",
				approved: "teal",
				archived: "grey",
			},
			addons: {
				pending: [],
				denied: [],
				approved: [],
				archived: [],
			},
			loading: {
				pending: true,
				denied: true,
				approved: true,
				archived: true,
			},
			contributors: [],

			showDenyPopup: false,
			denyAddon: {},
			archive: false,
			status: "pending",
			selectedAddonId: undefined,
		};
	},
	watch: {
		status(n) {
			// select first if not empty
			this.searchSet("status", n);
			this.selectedAddonId = this.addons[n].length > 0 ? this.addons[n][0].id : undefined;
		},
		selectedAddonId(n) {
			if (n !== undefined) this.searchSet("id", n);
			else this.searchDelete("id");
		},
		"$route.query": {
			handler(params, prev) {
				if (JSON.stringify(params) === JSON.stringify(prev)) return;
				this.searchUpdate();
			},
			deep: true,
			immediate: true,
		},
	},
	computed: {
		stats() {
			return Object.values(this.addons).map((v) => v.length);
		},
		categories() {
			return Object.keys(this.addons).map((s, i) => {
				return {
					label: this.$root.lang(`review.titles.${s}`),
					color: this.colors[s],
					value: s,
					count: this.stats[i] !== undefined ? String(this.stats[i]) : "",
				};
			});
		},
		items() {
			return Object.entries(this.addons)
				.map(([state, list]) => {
					return {
						state,
						items: list.map((addon) => {
							return {
								key: String(addon.id),
								primary: addon.name,
								secondary: addon.options.tags.join(", "),
							};
						}),
					};
				})
				.reduce((acc, cur) => {
					acc[cur.state] = cur.items;
					return acc;
				}, {});
		},
		selectedItems() {
			return this.items[this.status];
		},
		empty() {
			return this.$root.lang(`review.labels.${this.status}`);
		},
	},
	methods: {
		reviewAddon(addon, status, reason = null) {
			const id = typeof addon === "object" ? addon.id : addon;
			if (!this.$root.isUserLogged) return;

			const data = {
				status: status,
				reason: reason,
			};

			axios
				.put(`${this.$root.apiURL}/addons/${id}/review`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.selectedAddonId = undefined;
					this.update();
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		closeDenyPopup(send = false, reason) {
			this.showDenyPopup = false;
			if (send) this.reviewAddon(this.denyAddon, this.archive ? "archived" : "denied", reason);
		},
		openDenyPopup(addon, archive = undefined) {
			this.archive = !!archive;
			this.showDenyPopup = true;
			this.denyAddon = addon;
		},
		getAddonsByStatus(status) {
			return axios
				.get(`${this.$root.apiURL}/addons/${status}`, this.$root.apiOptions)
				.then((res) => {
					this.addons[status] = res.data;
					this.addons[status].forEach((addon) => (addon.options.tags = addon.options.tags.sort()));
					this.loading[status] = false;
					this.$forceUpdate();
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		getContributors() {
			axios
				.get(`${this.$root.apiURL}/users/names`)
				.then((res) => {
					this.contributors = res.data;
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		update() {
			Promise.all([
				this.getContributors(),
				this.getAddonsByStatus("pending"),
				this.getAddonsByStatus("denied"),
				this.getAddonsByStatus("approved"),
				this.getAddonsByStatus("archived"),
			])
				.then(() => {
					if (!this.selectedAddonId)
						this.selectedAddonId = (this.selectedItems[0] || {}).key || this.selectedAddonId;
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
				});
		},
		searchUpdate() {
			this.status = this.searchGet("status") || this.status;
			this.$nextTick(() => {
				this.selectedAddonId = this.searchGet("id") || this.selectedAddonId;
			});
		},
	},
	created() {
		this.searchUpdate();
	},
	mounted() {
		this.update();
		window.updatePageStyles(this);

		this.$root.$on("openDenyPopup", (args) => {
			this.openDenyPopup(...args);
		});

		this.$root.$on("reviewAddon", (args) => {
			this.reviewAddon(...args);
		});
	},
};
</script>
