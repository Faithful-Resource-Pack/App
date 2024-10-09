<template>
	<v-container>
		<div class="text-center" v-if="loading">
			<h2 class="mb-5">{{ $root.lang().posts.loading }}</h2>
			<v-progress-circular :size="70" :width="7" color="primary" indeterminate />
		</div>
		<template v-else>
			<v-tabs v-model="selectedTab" grow>
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
				<v-tabs-items v-model="selectedTab" style="background-color: transparent">
					<v-tab-item><general-tab v-model="formData" /></v-tab-item>
					<v-tab-item><download-tab v-model="downloads" /></v-tab-item>
					<v-tab-item><changelog-tab v-model="formData" /></v-tab-item>
				</v-tabs-items>
			</v-list>
		</template>
	</v-container>
</template>

<script>
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
		isNew: {
			type: Boolean,
			required: false,
			default: false,
		},
		value: {
			type: Object,
			required: true,
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			formData: {},
			downloads: [],
			selectedTab: null,
		};
	},
	methods: {
		onSubmit() {
			// only send data back on submit (faster)
			this.$emit("input", this.formData);
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
					acc[cur.category] = cur.items.reduce((a, c) => {
						a[c.name] = c.link;
						return a;
					}, {});
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
				this.downloads = this.convertDownloadsToArray(n);
			},
			deep: true,
		},
	},
};
</script>
