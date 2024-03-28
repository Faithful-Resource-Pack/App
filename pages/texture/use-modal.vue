<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="800">
		<path-modal
			:color="color"
			v-model="pathModalOpen"
			:disableDialog="closePathModal"
			:add="Object.keys(pathModalData).length == 0"
			:useID="formData.id"
			:data="pathModalData"
		/>
		<remove-confirm
			type="path"
			:confirm="remove.confirm"
			:disableDialog="closeAndUpdate"
			:data="remove.data"
		/>

		<v-card>
			<v-card-title class="headline">{{ dialogTitle }}</v-card-title>
			<v-card-text>
				<v-form ref="form" v-model="formValid">
					<v-text-field
						:color="color"
						v-model="formData.name"
						:label="$root.lang().database.labels.use_name"
					/>
					<v-text-field
						:color="color"
						required
						persistent-hint
						:hint="'⚠️ ' + $root.lang().database.hints.use_id"
						v-model="formData.id"
						:label="$root.lang().database.labels.use_id"
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
					<p v-if="add" align="center" style="color: red">
						⚠️<br /><strong>{{ $root.lang().database.hints.warning_path }}</strong>
					</p>
					<v-list v-if="Object.keys(formData.paths).length && add == false" label="Texture Paths">
						<v-list-item
							class="list-item-inline"
							v-for="(path, index) in formData.paths"
							:key="index"
						>
							<v-list-item-content>
								<v-list-item-title :title="path.name">{{ path.name }}</v-list-item-title>
								<v-list-item-subtitle :title="(path.versions || []).join(', ')">{{
									(path.versions || []).join(", ")
								}}</v-list-item-subtitle>
							</v-list-item-content>

							<v-list-item-action class="merged">
								<v-btn icon @click="openPathModal(path)">
									<v-icon color="lighten-1">mdi-pencil</v-icon>
								</v-btn>
								<v-btn icon @click="askRemovePath(path)">
									<v-icon color="red lighten-1">mdi-delete</v-icon>
								</v-btn>
							</v-list-item-action>
						</v-list-item>
					</v-list>

					<div v-else>
						<template v-if="add == false">{{
							$root.lang().database.labels.no_path_found
						}}</template>
					</div>

					<v-btn
						block
						:disabled="add"
						:style="{ 'margin-top': '10px' }"
						color="secondary"
						@click="openPathModal()"
					>
						{{ $root.lang().database.labels.add_new_path }} <v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="red darken-1" text @click="disableDialog">
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
import RemoveConfirm from "./remove-confirm.vue";

export default {
	name: "use-modal",
	components: {
		PathModal,
		RemoveConfirm,
	},
	props: {
		modalOpened: {
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
		usesLength: {
			type: Number,
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
			formValid: false,
			formData: {
				edition: "",
				id: "",
				texture: "",
				name: "",
				paths: {},
			},
			pathModalOpen: false,
			pathModalData: {},
			remove: {
				confirm: false,
				data: {},
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
		openPathModal(data = {}) {
			this.pathModalOpen = true;
			this.pathModalData = data;
		},
		closePathModal() {
			this.pathModalOpen = false;
			this.getPaths(this.formData.id);
			this.$forceUpdate();
		},
		closeAndUpdate() {
			this.remove.confirm = false;
			this.getPaths(this.formData.id);
			this.$forceUpdate();
		},
		MinecraftSorter(a, b) {
			const aSplit = a.split(".").map((s) => parseInt(s));
			const bSplit = b.split(".").map((s) => parseInt(s));

			if (aSplit.includes(NaN) || bSplit.includes(NaN)) {
				return String(a).localeCompare(String(b)); // compare as strings
			}

			const upper = Math.min(aSplit.length, bSplit.length);
			let i = 0;
			let result = 0;
			while (i < upper && result == 0) {
				result = aSplit[i] == bSplit[i] ? 0 : aSplit[i] < bSplit[i] ? -1 : 1; // each number
				++i;
			}

			if (result != 0) return result;

			result = aSplit.length == bSplit.length ? 0 : aSplit.length < bSplit.length ? -1 : 1; // longer length wins

			return result;
		},
		send() {
			const formData = this.formData;
			const data = {
				name: formData.name || "",
				texture: formData.texture,
				edition: formData.edition,
			};

			let method = "put";
			let useId = "";
			if (this.add) {
				data.id = formData.id;
				data.texture = Number.parseInt(this.$props.textureID, 10);
				method = "post";
			} else {
				useId = formData.id;
			}

			axios[method](`${this.$root.apiURL}/uses/${useId}`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.disableDialog(true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
		getPaths(useId) {
			axios
				.get(`${this.$root.apiURL}/uses/${useId}/paths`, this.$root.apiOptions)
				.then((res) => {
					const temp = res.data;
					this.formData.paths = {};

					for (let i = 0; i < temp.length; i++) {
						temp[i].versions.sort(this.MinecraftSorter);
						this.formData.paths[temp[i].id] = {
							...temp[i],
							use: temp[i].use || useId,
						};
					}
				})
				.catch((err) => {
					console.error(err);
				});
		},
		askRemovePath(data) {
			this.remove.data = data;
			this.remove.confirm = true;
		},
	},
	watch: {
		modalOpened(n, o) {
			this.$nextTick(() => {
				if (!this.add) {
					this.formData.edition = this.data.edition;
					this.formData.id = this.data.id;
					this.formData.name = this.data.name;
					this.formData.texture = this.data.texture;
					this.getPaths(this.data.id);
				} else {
					this.$refs.form.reset();
					if ("id" in this.data) this.formData.id = this.data.id;
					this.formData.paths = {};
				}
			});

			if (!n) this.disableDialog();
		},
	},
};
</script>
