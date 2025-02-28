<template>
	<div class="py-2">
		<v-row class="mb-2">
			<v-col cols="12" sm="3">
				<v-select
					outlined dense
					:items="packList"
					item-text="label"
					item-value="value"
					:value="current.pack"
					:label="$root.lang().gallery.category.pack"
					@change="updateRoute($event, 'pack')"
					hide-details
				/>
			</v-col>

			<v-col cols="12" sm="3">
				<v-select
					outlined dense
					:items="editionList"
					item-text="label"
					item-value="value"
					:value="current.edition"
					:label="$root.lang().gallery.category.edition"
					@change="updateRoute($event, 'edition')"
					hide-details
				/>
			</v-col>

			<v-col cols="12" sm="3">
				<v-select
					outlined dense
					:items="versionList"
					:value="current.version"
					item-text="label"
					item-value="value"
					:label="$root.lang().gallery.category.mc_version"
					@change="updateRoute($event, 'version')"
					hide-details
				/>
			</v-col>

			<v-col cols="12" sm="3">
				<v-select
					outlined dense
					:items="tagList"
					item-text="label"
					item-value="value"
					:value="current.tag"
					:label="$root.lang().gallery.category.tag"
					@change="updateRoute($event, 'tag')"
					hide-details
				/>
			</v-col>
		</v-row>

		<v-row class="mb-1 px-3">
			<v-text-field
				v-model="current.search"
				:append-icon="current.search ? 'mdi-send' : undefined"
				outlined dense
				clear-icon="mdi-close"
				clearable
				hide-details
				type="text"
				:label="$root.lang().database.textures.search_texture"
				@keyup.enter="startSearch"
				@click:append="startSearch"
			/>
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
		startSearch() {
			this.$emit("updateRoute");
		},
		clearSearch() {
			// avoid restarting search if there's already nothing there
			if (this.current.search === null) return;
			this.current.search = null;
			this.updateRoute();
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
				// nested ternary is really ugly
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
			return this.options.tags
				// filter out java and bedrock tags as they're already covered by edition
				.filter((t) => !['java', 'bedrock'].some(e => t.toLowerCase().includes(e)))
				.map((t) => ({
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
