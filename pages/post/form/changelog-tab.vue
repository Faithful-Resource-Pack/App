<template>
	<div>
		<!-- root level object is an array so it must be iterated over -->
		<post-changelog
			v-for="(_item, i) in changelog"
			:key="i"
			v-model="changelog[i]"
			@delete="remove(i)"
		/>
		<json-modal v-model="jsonModalOpen" initialValue="{}" @data="parseJSON" />
		<changelog-generator v-model="generatorOpen" />
		<div v-if="changelog.length" class="py-5">
			<v-divider />
		</div>
		<v-row>
			<!-- root level object is the only one that cannot contain string items -->
			<v-col>
				<v-btn block color="secondary" @click="addCategory">
					{{ $root.lang().posts.changelog.add_category }}<v-icon right>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>
		<br />
		<v-row>
			<v-col>
				<v-btn block color="secondary" @click="openGenerateModal">
					{{ $root.lang().posts.changelog_generator.heading }}<v-icon right>mdi-pencil</v-icon>
				</v-btn>
			</v-col>
			<v-col>
				<v-btn block color="secondary" @click="openJSONModal">
					{{ $root.lang().posts.changelog.import_json }}<v-icon right>mdi-code-json</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import JsonModal from "@components/json-modal.vue";
import PostChangelog from "./post-changelog.vue";
import ChangelogGenerator from "./changelog-generator.vue";

export default {
	name: "changelog-tab",
	components: {
		PostChangelog,
		JsonModal,
		ChangelogGenerator,
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
			generatorOpen: false,
			jsonModalOpen: false,
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
			this.jsonModalOpen = true;
		},
		openGenerateModal() {
			this.generatorOpen = true;
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
