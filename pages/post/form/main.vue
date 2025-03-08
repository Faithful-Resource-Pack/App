<template>
	<v-container>
		<div class="text-center" v-if="loading">
			<h2 class="mb-5">{{ $root.lang().posts.loading }}</h2>
			<v-progress-circular :size="70" :width="7" color="primary" indeterminate />
		</div>
		<template v-else>
			<v-tabs v-model="selectedTab" grow :class="[{ 'mx-n3': !$vuetify.breakpoint.mdAndUp }]">
				<v-tab style="text-transform: uppercase">
					{{ $root.lang().posts.general.heading }}
				</v-tab>
				<v-tab style="text-transform: uppercase">
					{{ $root.lang().posts.download.heading }}
				</v-tab>
				<v-tab style="text-transform: uppercase">
					{{ $root.lang().posts.changelog.heading }}
				</v-tab>
			</v-tabs>
			<v-list
				:class="['main-container', 'mb-2 pa-4', { 'mx-n3': !$vuetify.breakpoint.mdAndUp }]"
				:rounded="$vuetify.breakpoint.mdAndUp"
				two-line
			>
				<v-tabs-items v-model="selectedTab" style="background-color: transparent" class="pb-3">
					<v-tab-item><general-tab v-model="formData" /></v-tab-item>
					<v-tab-item><download-tab v-model="downloads" /></v-tab-item>
					<v-tab-item>
						<!-- need extra prop for the json modal (easier than tracking it here) -->
						<changelog-tab v-model="changelog" :convert="convertChangelogToArray" />
					</v-tab-item>
				</v-tabs-items>
				<div class="d-flex justify-end pa-2">
					<v-btn color="darken-1" text @click="() => onSubmit(false)">
						{{ $root.lang().global.btn.save_draft }}
					</v-btn>
					<v-btn color="primary" text @click="() => onSubmit(true)">
						{{ $root.lang().global.btn.publish }}
					</v-btn>
				</div>
			</v-list>
		</template>
	</v-container>
</template>

<script>
import axios from "axios";
import ChangelogTab from "./changelog-tab.vue";
import DownloadTab from "./download-tab.vue";
import GeneralTab from "./general-tab.vue";

export default {
	name: "post-form",
	components: {
		GeneralTab,
		DownloadTab,
		ChangelogTab,
	},
	props: {
		value: {
			type: Object,
			required: true,
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			formData: {},
			downloads: [],
			changelog: [],
			selectedTab: null,
		};
	},
	methods: {
		onSubmit(published) {
			const formData = {
				...this.formData,
				published,
				downloads: this.convertDownloadsToObject(this.downloads),
				changelog: this.convertChangelogToObject(this.changelog),
			};

			if (!formData.header_img) delete formData.header_img;

			let prom;
			if (this.add) {
				prom = axios.post(`${this.$root.apiURL}/posts`, formData, this.$root.apiOptions);
			} else {
				delete formData.id;
				prom = axios.put(
					`${this.$root.apiURL}/posts/${this.formData.id}`,
					formData,
					this.$root.apiOptions,
				);
			}
			prom
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(error, "error");
				});
		},
		convertDownloadsToArray(obj) {
			return Object.entries(obj).map(([category, items]) => {
				if (typeof items === "string")
					return { name: category, link: items, key: crypto.randomUUID() };
				return {
					category,
					items: Object.entries(items).map(([name, link]) => ({
						name,
						link,
						key: crypto.randomUUID(),
					})),
					key: crypto.randomUUID(),
				};
			});
		},
		convertDownloadsToObject(arr) {
			return arr.reduce((acc, cur) => {
				// single
				if (!cur.category) acc[cur.name] = cur.link;
				else
					acc[cur.category] = cur.items.reduce((a, { name, link }) => {
						a[name] = link;
						return a;
					}, {});
				return acc;
			}, {});
		},
		// these parsers took me two days to write
		convertChangelogToArray(obj, single = false) {
			if (typeof obj === "string") return obj;
			if (Array.isArray(obj)) {
				const s = obj.some((item) => typeof item === "string");
				return obj.map((item) => this.convertChangelogToArray(item, s));
			}
			if (single) {
				const key = Object.keys(obj)[0];
				return { category: key, items: this.convertChangelogToArray(obj[key]) };
			}
			return Object.entries(obj).map(([category, items]) => ({
				category,
				items: this.convertChangelogToArray(items),
			}));
		},
		convertChangelogToObject(arr) {
			if (typeof arr === "string") return arr;
			if (arr.category !== undefined)
				return { [arr.category]: arr.items.map((item) => this.convertChangelogToObject(item)) };
			if (arr.some((item) => typeof item === "string"))
				return arr.map((item) => this.convertChangelogToObject(item));
			return arr.reduce((acc, cur) => {
				acc[cur.category] = this.convertChangelogToObject(cur.items);
				return acc;
			}, {});
		},
	},
	watch: {
		value(n) {
			this.formData = n;
		},
		"formData.downloads": {
			handler(n) {
				if (!n) return;
				this.downloads = this.convertDownloadsToArray(n);
			},
			deep: true,
		},
		"formData.changelog": {
			handler(n) {
				if (!n) return;
				this.changelog = this.convertChangelogToArray(n);
			},
			deep: true,
		},
	},
};
</script>
