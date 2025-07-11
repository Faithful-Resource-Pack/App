<template>
	<modal-form v-model="modalOpened" :title="modalTitle" @close="$emit('close')" @submit="send">
		<v-form ref="form">
			<v-text-field
				v-if="add == false"
				v-model="formData.id"
				:color="color"
				disabled
				persistent-hint
				:hint="'⚠️' + $root.lang().database.textures.paths.id_hint"
				:label="$root.lang().database.textures.paths.id"
			/>
			<v-text-field
				v-if="add == false"
				v-model="formData.use"
				:color="color"
				:hint="'⚠️' + $root.lang().database.textures.uses.id_hint"
				:label="$root.lang().database.textures.uses.id"
			/>
			<v-text-field
				v-model="formData.name"
				:color="color"
				:hint="$root.lang().database.textures.paths.name_hint"
				:label="$root.lang().database.textures.paths.name"
				@change="(e) => formatPath(e)"
			/>
			<v-select
				v-model="formData.versions"
				:color="color"
				:item-color="color"
				required
				multiple
				small-chips
				deletable-chips
				:items="sortedVersions"
				:label="$root.lang().database.textures.paths.versions"
			/>
			<v-checkbox
				v-model="formData.mcmeta"
				:color="color"
				:label="$root.lang().database.textures.paths.mcmeta"
			/>
		</v-form>
	</modal-form>
</template>

<script>
import axios from "axios";
import versionSorter from "@helpers/versionSorter";

import ModalForm from "@components/modal-form.vue";

export default {
	name: "path-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		first: {
			type: Boolean,
			required: false,
			default: false,
		},
		data: {
			type: Object,
			required: true,
		},
		edition: {
			type: String,
			required: false,
			default: null,
		},
		// only used when adding to existing use
		useID: {
			type: String,
			required: false,
			default: null,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	data() {
		return {
			modalOpened: false,
			formData: {
				id: "",
				use: "",
				name: "",
				versions: [],
				mcmeta: false,
			},
		};
	},
	methods: {
		formatPath(e) {
			// windows fix
			this.formData.name = e.replace(/\\/g, "/").trim();
			// infer png extension if not present
			if (!e.includes(".")) this.formData.name += ".png";
		},
		send() {
			const data = {
				name: this.formData.name || "", // texture relative path
				use: this.formData.use || "", // Use ID
				mcmeta: this.formData.mcmeta || false, // is animated
				versions: this.formData.versions.sort(versionSorter), // ordered minecraft versions
			};

			// all use/path info is added in one big request on creation so we "beam" it back
			if (this.first) {
				delete data.use;
				this.$emit("pathAdded", data);
				return this.$emit("close");
			}

			if (this.add) data.use = this.useID;

			const requestPromise = this.add
				? axios.post(`${this.$root.apiURL}/paths`, data, this.$root.apiOptions)
				: axios.put(`${this.$root.apiURL}/paths/${this.formData.id}`, data, this.$root.apiOptions);

			requestPromise
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	computed: {
		modalTitle() {
			return this.add
				? this.$root.lang().database.textures.paths.add_path
				: this.$root.lang().database.textures.paths.change_path;
		},
		sortedVersions() {
			const versions = this.edition
				? Array.from(settings.versions[this.edition])
				: Object.values(settings.versions).flat();
			return versions.sort(versionSorter).reverse();
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				if (this.add) {
					this.$refs.form.reset();
					// autofill bedrock paths
					if (this.sortedVersions.length === 1)
						this.formData.versions = Array.from(this.sortedVersions);
				} else {
					this.formData.versions = Array.from(this.data.versions).sort(versionSorter);
					this.formData.id = this.data.id;
					this.formData.name = this.data.name;
					this.formData.use = this.data.use;
					this.formData.mcmeta = this.data.mcmeta;
				}
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
