<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="800">
		<path-modal
			:color="color"
			v-model="pathModalOpen"
			@close="closePathModal"
			:add="Object.keys(pathModalData).length == 0"
			:first="add"
			:useID="formData.id"
			:edition="formData.edition"
			:data="pathModalData"
			@pathAdded="pathAdded"
		/>
		<texture-remove-confirm
			type="path"
			v-model="remove.confirm"
			@close="closeAndUpdate"
			:data="remove.data"
		/>

		<v-card>
			<v-card-title class="headline">{{ dialogTitle }}</v-card-title>
			<v-card-text>
				<v-form ref="form" v-model="formValid">
					<v-text-field
						:color="color"
						v-if="add == false"
						disabled
						required
						persistent-hint
						:hint="'⚠️ ' + $root.lang().database.hints.use_id"
						v-model="formData.id"
						:label="$root.lang().database.labels.use_id"
					/>
					<v-text-field
						:color="color"
						v-model="formData.name"
						:label="$root.lang().database.labels.use_name"
					/>
					<v-text-field
						:color="color"
						v-if="add == false"
						persistent-hint
						:hint="'⚠️ ' + $root.lang().database.hints.texture_id"
						required
						clearable
						v-model="formData.texture"
						:label="$root.lang().database.labels.texture_id"
					/>
					<v-select
						required
						:color="color"
						:item-color="color"
						v-model="formData.edition"
						:items="editions"
						:label="$root.lang().database.labels.use_edition"
					/>
					<h2 class="title">{{ $root.lang().database.subtitles.paths }}</h2>
					<v-list v-if="Object.keys(formData.paths).length" label="Texture Paths">
						<v-list-item
							class="list-item-inline"
							v-for="(path, index) in formData.paths"
							:key="index"
						>
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
						{{ $root.lang().database.labels.no_path_found }}
					</div>

					<v-btn block :style="{ 'margin-top': '10px' }" color="secondary" @click="openPathModal()">
						{{ $root.lang().database.labels.add_new_path }} <v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="red darken-1" text @click="$emit('close')">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="darken-1" text @click="send" :disabled="!formValid">
					{{ $root.lang().global.btn.save }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";

import PathModal from "./path-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";
import MinecraftSorter from "@helpers/MinecraftSorter";
import { getNameFromPath } from "@helpers/paths";

export default {
	name: "use-modal",
	components: {
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
			default() {
				return ["java", "bedrock"];
			},
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
				confirm: false,
				data: {},
				index: null,
			},
		};
	},
	computed: {
		dialogTitle() {
			return this.add
				? this.$root.lang().database.titles.add_use
				: this.$root.lang().database.titles.change_use;
		},
	},
	methods: {
		openPathModal(data = {}, index = null) {
			this.pathModalOpen = true;
			this.pathModalData = data;
			if (this.add && index !== null) this.$delete(this.formData.paths, index);
		},
		closePathModal() {
			this.pathModalOpen = false;
			if (!this.add) this.getPaths(this.formData.id);
			this.$forceUpdate();
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
				this.remove.confirm = false;
				return;
			}

			this.remove.confirm = false;
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
						versions: p.versions.sort(MinecraftSorter),
					}));
				})
				.catch((err) => {
					console.error(err);
				});
		},
		askRemovePath(data, index) {
			this.remove.data = data;
			this.remove.confirm = true;
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
