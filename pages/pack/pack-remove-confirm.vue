<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="600">
		<v-card>
			<v-card-title class="headline">
				{{ $root.lang().database.titles.confirm_deletion }}
			</v-card-title>
			<v-card-text>
				<v-form ref="form" lazy-validation>
					<p>{{ label }}</p>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="darken-1" text @click="disableDialog">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="error darken-1" @click="deletePack">
					{{ $root.lang().global.btn.yes }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";

export default {
	name: "pack-remove-confirm",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: false,
		},
		disableDialog: {
			type: Function,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
		};
	},
	methods: {
		deletePack() {
			axios
				.delete(`${this.$root.apiURL}/${this.type}/${this.id}`, this.$root.apiOptions)
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
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$nextTick(() => this.$refs.form.reset());
			this.$emit("input", newValue);
		},
	},
};
</script>
