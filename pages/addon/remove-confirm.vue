<template>
	<v-dialog v-model="confirm" max-width="600">
		<v-card>
			<v-card-title class="headline">{{ $root.lang().addons.remove.title }}</v-card-title>
			<v-card-text>
				<v-form ref="form" lazy-validation>
					<p>{{ $root.lang().addons.remove.labels.question.replace("%s", title) }}</p>
					<p style="color: red">{{ $root.lang().addons.remove.labels.warning }}</p>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="darken-1" text @click="disableDialog">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="error darken-1" @click="deleteAddon">
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
	computed: {
		title() {
			return this.$props.data.name;
		},
	},
	methods: {
		deleteAddon() {
			const addon_id = JSON.parse(JSON.stringify(this.$props.data.id));

			axios
				.delete(`${this.$root.apiURL}/addons/${addon_id}`, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.disableDialog(true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(`${error.message} : ${error.response.data.error}`, "error");
					this.disableDialog(true);
				});
		},
	},
};
</script>
