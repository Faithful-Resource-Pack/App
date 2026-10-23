<template>
	<div>
		<v-row>
			<v-col cols="12" sm="6">
				<v-select
					hide-details
					:label="$root.lang().gallery.category.pack"
					:items="packList"
					item-text="label"
					item-value="value"
					:value="currentSearch.pack"
					@change="updateRoute($event, 'pack')"
				/>
			</v-col>

			<v-col cols="12" sm="6">
				<v-select
					hide-details
					:label="$root.lang().gallery.category.edition"
					:items="editionList"
					item-text="label"
					item-value="value"
					:value="currentSearch.edition"
					@change="updateRoute($event, 'edition')"
				/>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12" sm="6">
				<v-select
					hide-details
					:label="$root.lang().gallery.category.mc_version"
					:items="versionList"
					item-text="label"
					item-value="value"
					:value="currentSearch.version"
					@change="updateRoute($event, 'version')"
				/>
			</v-col>

			<v-col cols="12" sm="6">
				<v-select
					hide-details
					:label="$root.lang().gallery.category.tag"
					:items="tagList"
					item-text="label"
					item-value="value"
					:value="currentSearch.tag"
					@change="updateRoute($event, 'tag')"
				/>
			</v-col>
		</v-row>

		<gallery-display-options v-model="currentDisplay" :maxColumns="maxColumns" />
	</div>
</template>

<script>
import axios from "axios";

import GalleryDisplayOptions from "./gallery-display-options.vue";

export default {
	name: "gallery-options",
	components: {
		GalleryDisplayOptions,
	},
	props: {
		search: {
			type: Object,
			required: true,
		},
		display: {
			type: Object,
			required: true,
		},
		packToName: {
			type: Object,
			required: true,
		},
		maxColumns: {
			type: Number,
			required: false,
			default: 16,
		},
	},
	emits: ["update:search", "update:display", "updateRoute"],
	data() {
		return {
			// search values available
			options: {
				packs: [],
				tags: [],
				editions: ["all", ...settings.editions],
			},
			currentSearch: {},
			currentDisplay: {},
		};
	},
	methods: {
		updateRoute(data, type) {
			if (this.currentSearch[type] === data) return; // avoid redundant redirection

			this.currentSearch[type] = data;

			// check if pack exist
			if (!Object.keys(this.packToName).includes(this.currentSearch.pack))
				this.currentSearch.pack = "default";

			// actual updating is handled from main page
			this.$emit("updateRoute");
		},
	},
	computed: {
		packList() {
			return Object.entries(this.packToName).map(([id, name]) => ({
				label: name,
				value: id,
			}));
		},
		editionList() {
			return this.options.editions.map((e) => ({
				label: e === "all" ? this.$root.lang().gallery.all : e.toTitleCase(),
				value: e,
			}));
		},
		availableVersions() {
			return this.currentSearch.edition === "all"
				? ["latest", ...Object.values(settings.versions).flat()]
				: settings.versions[this.currentSearch.edition];
		},
		versionList() {
			return this.availableVersions.map((v) => {
				// nested ternary is really ugly
				if (v === "latest")
					return {
						label: this.$root.lang().gallery.latest,
						value: v,
					};
				return {
					// fix for B1.7 instead of b1.7
					label: /\d/g.test(v) ? v : v.toTitleCase(),
					value: v,
				};
			});
		},
		tagList() {
			return (
				this.options.tags
					// filter out java and bedrock tags as they're already covered by edition
					.filter((t) => !["java", "bedrock"].includes(t.toLowerCase()))
					.map((t) => ({
						// tags are already title cased
						label: t === "all" ? this.$root.lang().gallery.all : t,
						value: t,
					}))
			);
		},
	},
	created() {
		// saves a request
		this.options.packs = Object.values(this.packToName);

		axios.get(`${this.$root.apiURL}/textures/tags`).then((res) => {
			this.options.tags = ["all", ...res.data];
		});
	},
	watch: {
		search: {
			handler(newValue) {
				this.currentSearch = newValue;
			},
			deep: true,
			immediate: true,
		},
		currentSearch: {
			handler(newValue) {
				this.$emit("update:search", newValue);
			},
			deep: true,
		},
		display: {
			handler(newValue) {
				this.currentDisplay = newValue;
			},
			deep: true,
			immediate: true,
		},
		currentDisplay: {
			handler(newValue) {
				this.$emit("update:display", newValue);
			},
			deep: true,
		},
		// always keep current version in sync with edition
		availableVersions: {
			handler(newValue) {
				let update;
				// always prioritize latest if all is selected (probably wanted)
				if (this.currentSearch.edition === "all") update = "latest";
				else if (!newValue.includes(this.currentSearch.version)) update = newValue[0];

				if (update !== undefined) {
					this.currentSearch.version = update;
					// avoid redundant navigation if nothing changed
					this.$nextTick(() => this.$emit("updateRoute"));
				}
			},
			immediate: true,
		},
	},
};
</script>
