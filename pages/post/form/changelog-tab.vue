<template>
	<div>
		<!-- root level object is an array so it must be iterated over -->
		<post-changelog
			v-for="(item, i) in changelog"
			v-model="changelog[i]"
			@delete="remove(i)"
			:key="i"
		/>
		<div class="py-5" v-if="changelog.length">
			<v-divider />
		</div>
		<!-- root level object is the only one that cannot contain string items -->
		<v-btn class="my-1" block color="secondary" @click="addCategory">
			{{ $root.lang().posts.changelog.add_category }}<v-icon right>mdi-plus</v-icon>
		</v-btn>
	</div>
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
			type: Array,
			required: false,
		},
	},
	data() {
		return {
			changelog: [],
		};
	},
	methods: {
		addCategory() {
			this.$set(this.changelog, this.changelog.length, { category: "", items: [] });
		},
		remove(index) {
			this.changelog.splice(index, 1);
		},
	},
	watch: {
		value: {
			handler(n) {
				this.changelog = n;
			},
			immediate: true,
		},
		changelog(n) {
			this.$emit("input", n);
		},
	},
};
</script>
