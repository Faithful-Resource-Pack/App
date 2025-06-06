<template>
	<div>
		<!-- root level object is an array so it must be iterated over -->
		<post-changelog
			v-for="(_item, i) in changelog"
			:key="i"
			v-model="changelog[i]"
			@delete="remove(i)"
		/>
		<json-modal v-model="jsonModalOpened" initialValue="{}" @data="parseJSON" />
		<div v-if="changelog.length" class="py-5">
			<v-divider />
		</div>
		<v-row dense>
			<!-- root level object is the only one that cannot contain string items -->
			<v-col cols="12" sm="11">
				<v-btn class="my-1" block color="secondary" @click="addCategory">
					{{ $root.lang().posts.changelog.add_category }}<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</v-col>
			<v-col cols="12" sm="1">
				<v-btn class="my-1" block color="secondary" @click="openJSONModal">
					<v-icon>mdi-code-json</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import JsonModal from "@components/json-modal.vue";
import PostChangelog from "./post-changelog.vue";

export default {
	name: "changelog-tab",
	components: {
		PostChangelog,
		JsonModal,
	},
	props: {
		value: {
			type: Array,
			required: true,
		},
		convert: {
			type: Function,
			required: true,
		},
	},
	data() {
		return {
			jsonModalOpened: false,
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
		openJSONModal() {
			this.jsonModalOpened = true;
		},
		parseJSON(data) {
			this.changelog = this.convert(data);
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
