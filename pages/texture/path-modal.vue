<template>
	<v-dialog v-model="amOpened" content-class="colored" max-width="600">
		<v-card>
			<v-card-title class="headline">{{ subPathDialogTitle }}</v-card-title>
			<v-card-text>
				<v-row>
					<v-col class="col-12" :sm="12">
						<v-form ref="form">
							<v-text-field
								:color="color"
								v-if="add == false"
								:hint="'⚠️' + $root.lang().database.hints.path_id"
								v-model="subPathFormData.id"
								:label="$root.lang().database.labels.path_id"
							>
							</v-text-field>
							<v-text-field
								:color="color"
								v-if="add == false"
								:hint="'⚠️' + $root.lang().database.hints.use_id"
								v-model="subPathFormData.use"
								:label="$root.lang().database.labels.use_id"
							>
							</v-text-field>
							<v-text-field
								:color="color"
								:hint="$root.lang().database.hints.path"
								v-model="subPathFormData.name"
								@change="(e) => formatPath(e)"
								:label="$root.lang().database.labels.path"
							>
							</v-text-field>
							<v-select
								:color="color"
								:item-color="color"
								required
								multiple
								small-chips
								v-model="subPathFormData.versions"
								:items="sortedVersions"
								:label="$root.lang().database.labels.versions"
							>
							</v-select>
							<v-checkbox
								:color="color"
								v-model="subPathFormData.mcmeta"
								:label="$root.lang().database.labels.mcmeta"
							/>
						</v-form>
					</v-col>
				</v-row>
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
import Vue from "vue";
import axios from "axios";

export default {
	name: "path-modal",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		disableSubPathDialog: {
			type: Function,
			required: true,
		},
		add: {
			type: Boolean,
			required: false,
			default: false,
		},
		pathData: {
			type: Object,
			required: true,
		},
		versions: {
			type: Array,
			required: false,
			default() {
				return [...settings.versions.java, ...settings.versions.bedrock];
			},
		},
		use: {
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
			amOpened: false,
			subPathFormData: {
				id: "",
				use: "",
				name: "",
				versions: [],
				mcmeta: false,
			},
		};
	},
	computed: {
		subPathDialogTitle() {
			return this.add
				? this.$root.lang().database.titles.add_path
				: this.$root.lang().database.titles.change_path;
		},
		sortedVersions() {
			return this.versions.sort(this.MinecraftSorter);
		},
	},
	methods: {
		onCancel() {
			this.amOpened = false;
			this.disableSubPathDialog();
		},
		formatPath(e) {
			// windows fix
			this.subPathFormData.name = e.replace(/\\/g, "/").trim();
			// infer png extension if not present
			if (!e.includes(".")) this.subPathFormData.name += ".png";
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
			const data = {
				name: this.subPathFormData.name || "", // texture relative path
				use: this.subPathFormData.use || "", // Use ID
				mcmeta: this.subPathFormData.mcmeta || false, // is animated
				versions: this.subPathFormData.versions.sort(this.MinecraftSorter), // ordered minecraft versions
			};

			let method = "put";
			let pathId = "";
			if (this.add) {
				data.use = this.use;
				method = "post";
			} else {
				pathId = this.subPathFormData.id;
			}

			axios[method](`${this.$root.apiURL}/paths/${pathId}`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.disableSubPathDialog(true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	watch: {
		value(newValue) {
			this.amOpened = newValue;
		},
		amOpened(newValue) {
			Vue.nextTick(() => {
				if (!this.add) {
					this.subPathFormData.versions = this.pathData.versions.sort(this.MinecraftSorter);
					this.subPathFormData.id = this.pathData.id;
					this.subPathFormData.name = this.pathData.name;
					this.subPathFormData.use = this.pathData.use;
					this.subPathFormData.mcmeta = this.pathData.mcmeta;
				} else this.$refs.form.reset();
			});
			this.$emit("input", newValue);
		},
	},
};
</script>