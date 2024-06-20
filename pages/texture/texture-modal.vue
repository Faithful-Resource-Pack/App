<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="600">
		<use-modal
			:color="color"
			v-model="useModalOpen"
			@close="closeUseModal"
			:add="useModalAdd"
			:textureID="formData.id"
			:data="useModalData"
		/>
		<texture-remove-confirm
			type="use"
			v-model="remove.confirm"
			@close="closeAndUpdate"
			:data="remove.data"
		/>

		<v-card>
			<v-card-title class="headline">{{ dialogTitle }}</v-card-title>
			<v-card-text>
				<v-form ref="form">
					<v-text-field
						:disabled="!add"
						:color="color"
						persistent-hint
						:hint="'⚠️' + $root.lang().database.hints.texture_id"
						required
						:readonly="add == false"
						v-model="formData.id"
						:label="$root.lang().database.labels.texture_id"
					/>
					<v-text-field
						:color="color"
						required
						clearable
						v-model="formData.name"
						:label="$root.lang().database.labels.texture_name"
					/>
					<v-combobox
						:color="color"
						:item-color="color"
						required
						multiple
						deletable-chips
						small-chips
						@change="
							() => {
								formData.tags = sortTags(formData.tags);
							}
						"
						v-model="formData.tags"
						:items="tags"
						:label="$root.lang().database.labels.texture_tags"
					/>

					<h2 class="title">{{ $root.lang().database.subtitles.uses }}</h2>
					<v-list
						v-if="Object.keys(formData.uses).length"
						:label="$root.lang().database.labels.texture_uses"
					>
						<v-list-item
							class="list-item-inline"
							v-for="(use, index) in formData.uses"
							:key="index"
						>
							<v-list-item-avatar
								tile
								:class="[color, textColor]"
								:style="{
									padding: '0 10px 0 10px',
									'border-radius': '4px !important',
									width: 'auto',
								}"
							>
								#{{ index }}
							</v-list-item-avatar>

							<v-list-item-content>
								<v-list-item-title>
									<v-list-item style="display: inline; padding: 0 0 0 5px">
										<template v-if="use.name">{{ use.name }}</template>
										<template v-else>
											<i>{{ $root.lang().database.labels.nameless }}</i>
										</template>
									</v-list-item>
									<v-list-item-subtitle style="display: block; padding: 0 0 0 5px">
										{{ use.edition }}
									</v-list-item-subtitle>
								</v-list-item-title>
							</v-list-item-content>

							<v-list-item-action class="merged">
								<v-btn icon @click="openUseModal(use, false)">
									<v-icon color="lighten-1">mdi-pencil</v-icon>
								</v-btn>
								<v-btn icon @click="askRemoveUse(use)">
									<v-icon color="red lighten-1">mdi-delete</v-icon>
								</v-btn>
							</v-list-item-action>
						</v-list-item>
					</v-list>
					<div v-else>{{ $root.lang().database.labels.no_use_found }}</div>

					<v-btn
						block
						:style="{ 'margin-top': '10px' }"
						color="secondary"
						@click="openUseModal(null, true)"
					>
						{{ $root.lang().database.labels.add_new_use }}
						<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="red darken-1" text @click="onCancel">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="darken-1" text @click="send">
					{{ $root.lang().global.btn.save }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";

import UseModal from "./use-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";
import { formatTag, sortTags } from "@helpers/textures";
import { getTagFromPath } from "@helpers/paths";

export default {
	name: "texture-modal",
	components: {
		UseModal,
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
		tags: {
			type: Array,
			required: false,
			default() {
				return [];
			},
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		textColor: {
			type: String,
			required: false,
			default: "",
		},
	},
	data() {
		return {
			modalOpened: false,
			formData: {
				name: "",
				tags: [],
				id: "",
				uses: {},
			},
			useModalOpen: false,
			useModalData: {},
			useModalAdd: false,
			remove: {
				confirm: false,
				data: {},
			},
		};
	},
	computed: {
		dialogTitle() {
			return this.add
				? this.$root.lang().database.titles.add_texture
				: this.$root.lang().database.titles.change_texture;
		},
	},
	methods: {
		openUseModal(data, add) {
			this.useModalOpen = true;
			this.useModalAdd = add;
			this.useModalData = data || { texture: this.formData.id };
		},
		closeUseModal() {
			this.useModalOpen = false;
			// fix for previous modal's paths showing up in blank one
			this.useModalData = {};
			this.getUses(this.formData.id);
			this.$forceUpdate();
		},
		closeAndUpdate() {
			this.remove.confirm = false;
			this.getUses(this.formData.id);
			this.$forceUpdate();
		},
		send() {
			if (!this.$root.isUserLogged) return;

			const data = {
				name: this.formData.name,
				tags: sortTags(this.formData.tags),
			};

			// modal isn't used for adding anymore but oh well
			const promise = this.add
				? axios.post(`${this.$root.apiURL}/textures`, data, this.$root.apiOptions)
				: axios.put(
						`${this.$root.apiURL}/textures/${this.formData.id}`,
						data,
						this.$root.apiOptions,
					);

			promise
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		recomputeTagList() {
			// compute based on existing paths and uses
			axios
				.get(`${this.$root.apiURL}/textures/${this.formData.id}/paths`, this.$root.apiOptions)
				.then((res) => {
					this.formData.tags = sortTags([
						...Object.values(this.formData.uses).map((v) => v.edition.toTitleCase()),
						...(res.data || []).map((path) => formatTag(getTagFromPath(path.name))),
					]);
				})
				.catch((err) => console.log(err));
		},
		getUses(textureID) {
			axios
				.get(`${this.$root.apiURL}/textures/${textureID}/uses`, this.$root.apiOptions)
				.then((res) => {
					this.formData.uses = Object.values(res.data).reduce((acc, cur) => {
						acc[cur.id] = cur;
						return acc;
					}, {});
					// recompute tag list once uses are loaded
					this.recomputeTagList();
				})
				.catch((err) => console.error(err));
		},
		askRemoveUse(data) {
			this.remove.data = data;
			this.remove.confirm = true;
		},
		onCancel() {
			this.modalOpened = false;
			this.$emit("close");
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => {
				if (this.add) this.$refs.form.reset();

				if (!this.add) {
					this.formData.name = this.data.name;
					this.formData.tags = this.data.tags;
					this.formData.id = this.data.id;
					this.getUses(this.data.id);
				}
			});
			this.$emit("input", newValue);
		},
	},
};
</script>
