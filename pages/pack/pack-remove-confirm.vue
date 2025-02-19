<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().database.confirm_deletion"
		@close="$emit('close')"
		@submit="deletePack"
	>
		<p>{{ label }}</p>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@components/modal-form.vue";

export default {
	name: "pack-remove-confirm",
	components: {
		ModalForm,
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
					this.$emit("close", true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(err, "error");
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
