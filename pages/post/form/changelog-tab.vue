<template>
	<post-changelog v-model="changelog" />
</template>

<script>
import PostChangelog from "./post-changelog.vue";

export default {
	name: "changelog-tab",
	components: {
		PostChangelog,
	},
	props: {
		value: {
			type: Object,
			required: false,
		},
	},
	data() {
		return {
			changelog: [],
		};
	},
	methods: {
		// these parsers took me two days to write
		convertChangelogToArray(obj, single = false) {
			if (typeof obj === "string") return obj;
			if (Array.isArray(obj)) {
				const s = obj.some((v) => typeof v === "string");
				return obj.map((v) => this.convertChangelogToArray(v, s));
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
				return { [arr.category]: arr.items.map((v) => this.convertChangelogToObject(v)) };
			if (arr.some((v) => typeof v === "string"))
				return arr.map((v) => this.convertChangelogToObject(v));
			return arr.reduce((acc, cur) => {
				acc[cur.category] = this.convertChangelogToObject(cur.items);
				return acc;
			}, {});
		},
	},
	created() {
		this.changelog = this.convertChangelogToArray(this.value || { "": [] });
	},
	watch: {
		changelog: {
			handler(n) {
				this.$emit("input", this.convertChangelogToObject(n));
			},
			deep: true,
		},
	},
};
</script>
