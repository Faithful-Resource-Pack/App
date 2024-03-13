<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="600">
		<use-modal
			:color="color"
			:modalOpened="useModalOpen"
			:disableDialog="closeUseModal"
			:add="useModalAdd"
			:textureID="formData.id"
			:usesLength="Object.keys(formData.uses).length"
			:data="useModalData"
		/>
		<remove-confirm
			type="use"
			:confirm="remove.confirm"
			:disableDialog="closeAndUpdate"
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
								>#{{ index }}</v-list-item-avatar
							>

							<v-list-item-content>
								<v-list-item-title>
									<v-list-item style="display: inline; padding: 0 0 0 5px">
										<template v-if="use.name">{{ use.name }}</template>
										<template v-else>
											<i>{{ $root.lang().database.labels.nameless }}</i>
										</template>
									</v-list-item>
									<v-list-item-subtitle style="display: block; padding: 0 0 0 5px">{{
										use.edition
									}}</v-list-item-subtitle>
								</v-list-item-title>
							</v-list-item-content>

							<v-list-item-action class="merged">
								<v-btn icon @click="openSubDialog(use, false)">
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
						@click="openSubDialog(null, true)"
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
import RemoveConfirm from "./remove-confirm.vue";

export default {
	name: "texture-modal",
	components: {
		UseModal,
		RemoveConfirm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		disableDialog: {
			type: Function,
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
		openSubDialog(data, add) {
			this.useModalOpen = true;
			this.useModalAdd = add;

			if (add) {
				const textureID = String(this.formData.id);
				const useIDs = Object.keys(this.formData.uses);
				const useLetters = useIDs.map((uid) => uid.replace(textureID, "")[0]);
				const maxLetter = useLetters.reduce((acc, cur) => (acc < cur ? cur : acc), "a");
				const nextLetter = String.fromCharCode(maxLetter.charCodeAt(0) + 1);
				const nextID = textureID + nextLetter;
				// Autofill use id
				this.useModalData = { id: nextID };
			} else this.useModalData = data;
		},
		closeUseModal() {
			this.useModalOpen = false;
			this.getUses(this.formData.id);
			this.$forceUpdate();
		},
		closeAndUpdate() {
			this.remove.confirm = false;
			this.getUses(this.formData.id);
			this.$forceUpdate();
		},

		sortTags(input) {
			// remove duplicates/null items and alphabetically sort
			let arr = [...new Set(input.filter((i) => i))].sort();
			// shift broader tags to start
			if (arr.includes("Realms")) arr = ["Realms", ...arr.filter((i) => i !== "Realms")];
			if (arr.includes("Modded")) arr = ["Modded", ...arr.filter((i) => i !== "Modded")];
			if (arr.includes("Bedrock")) arr = ["Bedrock", ...arr.filter((i) => i !== "Bedrock")];
			if (arr.includes("Java")) arr = ["Java", ...arr.filter((i) => i !== "Java")];
			return arr;
		},
		send() {
			if (!this.$root.isUserLogged) return;

			const data = {
				name: this.formData.name,
				tags: this.sortTags(this.formData.tags),
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
					this.disableDialog(true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		getUses(textureID) {
			axios
				.get(`${this.$root.apiURL}/textures/${textureID}/uses`, this.$root.apiOptions)
				.then((res) => {
					// dynamic edition tags
					const editionlessTags = (this.formData.tags || []).filter(
						(r) => !["Java", "Bedrock"].includes(r),
					);
					this.formData.tags = this.sortTags([
						...Object.values(res.data).map((v) => v.edition.toTitleCase()),
						...editionlessTags,
					]);
					this.formData.uses = Object.values(res.data).reduce((acc, cur) => {
						acc[cur.id] = cur;
						return acc;
					}, {});
				})
				.catch((err) => console.error(err));
		},
		askRemoveUse(data) {
			this.remove.data = data;
			this.remove.confirm = true;
		},
		onCancel() {
			this.modalOpened = false;
			this.disableDialog();
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			if (newValue === true) {
				this.$nextTick(() => {
					if (this.add) this.$refs.form.reset();

					if (!this.add) {
						this.formData.name = this.data.name;
						this.formData.tags = this.data.tags;
						this.formData.id = this.data.id;
						this.getUses(this.data.id);
					}
				});
			} else {
				// Fixes bug where click outside changes dialog to false but not dialogOpen to false
				this.disableDialog();
			}
			this.$emit("input", newValue);
		},
	},
};
</script>
