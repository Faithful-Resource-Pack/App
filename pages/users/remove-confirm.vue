<template>
	<v-dialog v-model="confirm" content-class="colored" max-width="600">
		<v-card>
			<v-card-title class="headline">{{
				$root.lang().database.titles.confirm_deletion
			}}</v-card-title>
			<v-card-text>
				<v-form ref="form" lazy-validation>
					<p>
						{{
							$root
								.lang()
								.database.labels.ask_deletion.replace("%s", data.username)
								.replace("%d", data.id)
						}}
					</p>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="darken-1" text @click="disableDialog">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="error darken-1" @click="deleteContributor">
					{{ $root.lang().global.btn.yes }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";

export default {
	name: "remove-confirm",
	props: {
		confirm: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
		disableDialog: {
			type: Function,
			required: true,
		},
	},
	data() {
		return {
			formData: {},
		};
	},
	computed: {
		username() {
			return this.$props.data.username;
		},
		id() {
			return this.$props.data.id;
		},
	},
	methods: {
		deleteContributor() {
			axios
				.delete(`${this.$root.apiURL}/users/${this.id}`, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.disableDialog(true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(err, "error");
					this.disableDialog(true);
				});
		},
	},
};
</script>
