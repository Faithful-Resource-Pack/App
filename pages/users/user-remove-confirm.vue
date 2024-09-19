<template>
	<modal-form
		v-model="modalOpened"
		danger
		:title="$root.lang().database.titles.confirm_deletion"
		@close="$emit('close')"
		@submit="deleteUser"
	>
		<p>
			{{
				$root
					.lang()
					.database.labels.ask_deletion.replace("%s", data.username)
					.replace("%d", data.id)
			}}
		</p>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@components/modal-form.vue";

export default {
	name: "user-remove-confirm",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		data: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
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
		deleteUser() {
			axios
				.delete(`${this.$root.apiURL}/users/${this.id}`, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(err, "error");
					this.$emit("close", true);
				});
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
