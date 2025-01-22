<template>
	<div>
		<v-row>
			<v-col cols="12" sm="6">
				<v-select
					:items="packList"
					item-text="label"
					item-value="value"
					:value="current.pack"
					:label="$root.lang('gallery.category.pack')"
					@change="updateRoute($event, 'pack')"
				/>
			</v-col>

			<v-col cols="12" sm="6">
				<v-select
					:items="editionList"
					item-text="label"
					item-value="value"
					:value="current.edition"
					:label="$root.lang('gallery.category.edition')"
					@change="updateRoute($event, 'edition')"
				/>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12" sm="6">
				<v-select
					:items="versionList"
					:value="current.version"
					item-text="label"
					item-value="value"
					:label="$root.lang('gallery.category.mc_version')"
					@change="updateRoute($event, 'version')"
				/>
			</v-col>

			<v-col cols="12" sm="6">
				<v-select
					:items="tagList"
					item-text="label"
					item-value="value"
					:value="current.tag"
					:label="$root.lang('gallery.category.tag')"
					@change="updateRoute($event, 'tag')"
				/>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import axios from "axios";

export default {
	name: "gallery-options",
	props: {
		value: {
			type: Object,
			required: true,
		},
		packToName: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			// search values available
			options: {
				packs: [],
				tags: ["all"],
				versions: ["latest", ...settings.versions.java, ...settings.versions.bedrock],
				editions: ["all", ...settings.editions],
			},
			current: {},
		};
	},
	methods: {
		updateRoute(data, type) {
			if (this.current[type] === data) return; // avoid redundant redirection

			this.current[type] = data;

			// check if pack exist
			if (!Object.keys(this.packToName).includes(this.current.pack)) this.current.pack = "default";

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
		versionList() {
			return this.options.versions.map((v) => {
				if (v === "latest")
					return {
						label: this.$root.lang().gallery.latest,
						value: v,
					};
				else
					return {
						// fix for B1.7 instead of b1.7
						label: /\d/g.test(v) ? v : v.toTitleCase(),
						value: v,
					};
			});
		},
		tagList() {
			return this.options.tags.map((t) => ({
				// tags are already title cased
				label: t === "all" ? this.$root.lang().gallery.all : t,
				value: t,
			}));
		},
	},
	created() {
		// saves a request
		this.options.packs = Object.values(this.packToName);

		axios.get(`${this.$root.apiURL}/textures/tags`).then((res) => {
			this.options.tags = [...this.options.tags, ...res.data];
		});
	},
	watch: {
		value: {
			handler(newValue) {
				this.current = newValue;
			},
			deep: true,
			immediate: true,
		},
		current: {
			handler(newValue) {
				this.$emit("input", newValue);
			},
			deep: true,
		},
		// always keep versions in sync with edition
		"current.edition": {
			handler(newValue) {
				this.options.versions =
					newValue === "all"
						? ["latest", ...settings.versions.java, ...settings.versions.bedrock]
						: settings.versions[newValue] || settings.versions.java;

				// no need to update current version if the edition supports it
				if (this.options.versions.includes(this.current.version)) return;

				// version needs updating to match edition, update route too
				this.current.version = this.options.versions[0];
				this.$emit("updateRoute");
			},
			immediate: true,
		},
	},
};
</script>
