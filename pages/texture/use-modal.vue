<template>
	<modal-form
		v-model="modalOpened"
		max-width="800"
		:disabled="!formValid"
		:title="modalTitle"
		@close="$emit('close')"
		@submit="send"
	>
		<path-modal
			v-model="pathModalOpen"
			:color="color"
			:add="Object.keys(pathModalData).length == 0"
			:first="add"
			:useID="formData.id"
			:edition="formData.edition"
			:data="pathModalData"
			@close="closePathModal"
			@pathAdded="pathAdded"
		/>
		<texture-remove-confirm
			v-model="remove.open"
			type="path"
			:data="remove.data"
			@close="closeAndUpdate"
		/>

		<v-form ref="form" v-model="formValid">
			<v-text-field
				v-if="add == false"
				v-model="formData.id"
				:color="color"
				disabled
				required
				persistent-hint
				:hint="'⚠️ ' + $root.lang().database.textures.uses.id_hint"
				:label="$root.lang().database.textures.uses.id"
			/>
			<v-text-field
				v-model="formData.name"
				:color="color"
				:label="$root.lang().database.textures.uses.name"
			/>
			<v-text-field
				v-if="add == false"
				v-model="formData.texture"
				:color="color"
				persistent-hint
				:hint="'⚠️ ' + $root.lang().database.textures.modal.id_hint"
				required
				clearable
				:label="$root.lang().database.textures.modal.id"
			/>
			<v-select
				v-model="formData.edition"
				required
				:color="color"
				:item-color="color"
				:items="editions"
				:label="$root.lang().database.textures.uses.edition"
			/>
			<h2 class="title">{{ $root.lang().database.textures.paths.title }}</h2>
			<v-list v-if="Object.keys(formData.paths).length">
				<v-list-item v-for="(path, index) in formData.paths" :key="index" class="list-item-inline">
					<v-list-item-content>
						<v-list-item-title :title="path.name">{{ path.name }}</v-list-item-title>
						<v-list-item-subtitle :title="(path.versions || []).join(', ')">
							{{ (path.versions || []).join(", ") }}
						</v-list-item-subtitle>
					</v-list-item-content>

					<v-list-item-action class="merged">
						<v-btn icon @click="openPathModal(path, index)">
							<v-icon color="lighten-1">mdi-pencil</v-icon>
						</v-btn>
						<v-btn icon @click="askRemovePath(path, index)">
							<v-icon color="red lighten-1">mdi-delete</v-icon>
						</v-btn>
					</v-list-item-action>
				</v-list-item>
			</v-list>

			<div v-else>
				{{ $root.lang().database.textures.paths.no_path_found }}
			</div>

			<v-btn block class="mt-2" color="secondary" @click="openPathModal()">
				{{ $root.lang().database.textures.paths.add_path }}
				<v-icon right>mdi-plus</v-icon>
			</v-btn>
		</v-form>
	</modal-form>
</template>

<script>
import axios from "axios";

import ModalForm from "@components/modal-form.vue";
import PathModal from "./path-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";
import versionSorter from "@helpers/versionSorter";
import { getNameFromPath } from "@helpers/paths";

export default {
	name: "use-modal",
	components: {
		ModalForm,
		PathModal,
		TextureRemoveConfirm,
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
		data: {
			type: Object,
			required: true,
		},
		editions: {
			type: Array,
			required: false,
			default: () => settings.editions,
		},
		textureID: {
			type: String,
			required: true,
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
			formValid: false,
			formData: {
				edition: "",
				id: "",
				texture: "",
				name: "",
				paths: [],
			},
			pathModalOpen: false,
			pathModalData: {},
			remove: {
				open: false,
				data: {},
				index: null,
			},
		};
	},
	computed: {
		modalTitle() {
			return this.add
				? this.$root.lang().database.textures.uses.add_use
				: this.$root.lang().database.textures.uses.change_use;
		},
	},
	methods: {
		openPathModal(data = {}, index = null) {
			this.pathModalOpen = true;
			this.pathModalData = data;
			if (this.add && index !== null) this.$delete(this.formData.paths, index);
		},
		closePathModal() {
			if (!this.add) this.getPaths(this.formData.id);
		},
		pathAdded(data) {
			// won't trigger update otherwise
			this.$set(this.formData.paths, this.formData.paths.length, data);
			if (this.formData.name) return;

			this.formData.name ||= getNameFromPath(data.name);
		},
		closeAndUpdate() {
			if (this.add && this.remove.index !== null) {
				this.$delete(this.formData.paths, this.remove.index);
				this.remove.index = null;
				return;
			}

			this.getPaths(this.formData.id);
			this.$forceUpdate();
		},

		send() {
			const formData = this.formData;
			const data = {
				name: formData.name || "",
				texture: formData.texture,
				edition: formData.edition,
			};

			if (this.add) data.paths = this.formData.paths || [];

			const requestPromise = this.add
				? axios.post(`${this.$root.apiURL}/uses/${formData.texture}`, data, this.$root.apiOptions)
				: axios.put(`${this.$root.apiURL}/uses/${formData.id}`, data, this.$root.apiOptions);

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
		getPaths(useId) {
			if (!useId) return;

			axios
				.get(`${this.$root.apiURL}/uses/${useId}/paths`, this.$root.apiOptions)
				.then((res) => {
					const paths = res.data;

					// reset path data
					this.formData.paths = paths.map((p) => ({
						...p,
						use: p.use || useId,
						versions: p.versions.sort(versionSorter),
					}));
				})
				.catch((err) => {
					console.error(err);
				});
		},
		askRemovePath(data, index) {
			this.remove.data = data;
			this.remove.open = true;
			this.remove.index = index;
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				this.$refs.form.reset();
				for (const [k, v] of Object.entries(this.data)) {
					this.formData[k] = v;
				}
				if (this.add) this.formData.paths = this.data.paths || [];
				else this.getPaths(this.data.id);
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
