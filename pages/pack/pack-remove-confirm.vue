<template>
	<remove-confirm
		v-model="modalOpened"
		:title="$root.lang().database.titles.confirm_deletion"
		:disableDialog="disableDialog"
		@confirm="deletePack"
	>
		<p>{{ label }}</p>
	</remove-confirm>
</template>

<script>
import axios from "axios";
import RemoveConfirm from "../components/remove-confirm.vue";

export default {
	name: "pack-remove-confirm",
	components: {
		RemoveConfirm,
	},
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
