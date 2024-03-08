<template>
	<v-dialog v-model="dialog" content-class="colored" max-width="600">
		<v-card>
			<v-card-title class="headline">{{ dialogTitle }}</v-card-title>
			<v-card-text>
				<v-row>
					<v-col v-if="formData.uuid" class="col-2" :sm="$vuetify.breakpoint.mdAndUp ? 3 : 2">
						<img
							alt="avatar"
							style="width: 100%; max-width: 250"
							:src="
								($vuetify.breakpoint.mdAndUp
									? 'https://visage.surgeplay.com/full/256/'
									: 'https://visage.surgeplay.com/head/128/') + formData.uuid
							"
						/>
					</v-col>
					<v-col
						:class="'col-' + formData.uuid ? '10' : '12'"
						:sm="formData.uuid ? ($vuetify.breakpoint.mdAndUp ? 9 : 10) : 12"
					>
						<v-form ref="form" lazy-validation>
							<v-text-field
								:color="color"
								required
								:readonly="add == false"
								v-model="formData.id"
								:label="$root.lang().database.labels.discord_id"
							/>
							<v-text-field
								:color="color"
								required
								clearable
								v-model="formData.username"
								:label="$root.lang().database.labels.username"
							/>
							<v-select
								:color="color"
								:item-color="color"
								required
								multiple
								small-chips
								v-model="formData.roles"
								:items="roles"
								:label="$root.lang().database.labels.user_role"
							/>
							<v-text-field
								:color="color"
								clearable
								v-model="formData.uuid"
								:label="$root.lang().database.labels.uuid"
							/>
							<v-checkbox
								:color="color"
								required
								clearable
								v-model="formData.anonymous"
								:label="$root.lang().database.labels.anonymous"
							/>
							<v-text v-if="formData.anonymous">{{
								$root.lang().database.labels.anonymous_explain
							}}</v-text>
						</v-form>
					</v-col>
				</v-row>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="red darken-1" text @click="disableDialog">
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
	name: "user-modal",
	props: {
		dialog: {
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
			required: false,
		},
		roles: {
			type: Array,
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
			formData: {
				username: "",
				roles: [],
				uuid: "",
				anonymous: false,
				id: "",
			},
			default: {
				username: "",
				roles: [],
				uuid: "",
				anonymous: false,
			},
		};
	},
	computed: {
		dialogTitle() {
			return this.add
				? this.$root.lang().database.titles.add_user
				: this.$root.lang().database.titles.change_user;
		},
	},
	methods: {
		send() {
			const data = this.formData;
			const id = data.id;

			delete data.id; // excess property and therefore is not allowed
			delete data.media; // excess property and therefore is not allowed

			Object.keys(data).forEach((k) => (data[k] = data[k] === null ? this.default[k] : data[k]));

			axios
				.post(`${this.$root.apiURL}/users/${id}`, data, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.disableDialog(true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	watch: {
		dialog() {
			Vue.nextTick(() => {
				if (!this.add)
					Object.keys(this.data).forEach((key) => {
						this.formData[key] = this.data[key];
					});
				else
					this.formData = {
						username: "",
						roles: [],
						uuid: "",
						anonymous: false,
						id: "",
					};
			});
		},
	},
};
</script>
