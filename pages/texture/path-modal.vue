<template>
	<modal-form v-model="modalOpened" :title="dialogTitle" @close="onCancel" @submit="send">
		<v-form ref="form">
			<v-text-field
				:color="color"
				v-if="add == false"
				disabled
				persistent-hint
				:hint="'⚠️' + $root.lang().database.hints.path_id"
				v-model="formData.id"
				:label="$root.lang().database.labels.path_id"
			/>
			<v-text-field
				:color="color"
				v-if="add == false"
				:hint="'⚠️' + $root.lang().database.hints.use_id"
				v-model="formData.use"
				:label="$root.lang().database.labels.use_id"
			/>
			<v-text-field
				:color="color"
				:hint="$root.lang().database.hints.path"
				v-model="formData.name"
				@change="(e) => formatPath(e)"
				:label="$root.lang().database.labels.path"
			/>
			<v-select
				:color="color"
				:item-color="color"
				required
				multiple
				small-chips
				v-model="formData.versions"
				:items="sortedVersions"
				:label="$root.lang().database.labels.versions"
			/>
			<v-checkbox
				:color="color"
				v-model="formData.mcmeta"
				:label="$root.lang().database.labels.mcmeta"
			/>
		</v-form>
	</modal-form>
</template>

<script>
import axios from "axios";
import MinecraftSorter from "@helpers/MinecraftSorter";

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
		},
		useID: {
			type: String,
			required: false,
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
		onCancel() {
			this.modalOpened = false;
			this.$emit("close");
		},
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
				versions: this.formData.versions.sort(this.MinecraftSorter), // ordered minecraft versions
			};

			// all use/path info is added in one big request on creation so we "beam" it back
			if (this.first) {
				delete data.use;
				this.$emit("pathAdded", data);
				return this.$emit("close");
			}

			let method = "put";
			let pathId = "";
			if (this.add) {
				data.use = this.useID;
				method = "post";
			} else {
				pathId = this.formData.id;
			}

			axios[method](`${this.$root.apiURL}/paths/${pathId}`, data, this.$root.apiOptions)
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
		dialogTitle() {
			return this.add
				? this.$root.lang().database.titles.add_path
				: this.$root.lang().database.titles.change_path;
		},
		sortedVersions() {
			return (
				settings.versions[this.edition] || [...settings.versions.java, ...settings.versions.bedrock]
			).sort(MinecraftSorter);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				if (!this.add) {
					this.formData.versions = this.data.versions.sort(MinecraftSorter);
					this.formData.id = this.data.id;
					this.formData.name = this.data.name;
					this.formData.use = this.data.use;
					this.formData.mcmeta = this.data.mcmeta;
				} else {
					this.$refs.form.reset();
					// autofill bedrock paths
					if (this.sortedVersions.length === 1) this.formData.versions = this.sortedVersions;
				}
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
