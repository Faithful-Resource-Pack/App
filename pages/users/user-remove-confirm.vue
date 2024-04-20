<template>
	<remove-confirm
		v-model="modalOpened"
		:title="$root.lang().database.titles.confirm_deletion"
		@close="$emit('close')"
		@confirm="deleteUser"
	>
		<p>
			{{
				$root
					.lang()
					.database.labels.ask_deletion.replace("%s", data.username)
					.replace("%d", data.id)
			}}
		</p>
	</remove-confirm>
</template>

<script>
import axios from "axios";
import RemoveConfirm from "../components/remove-confirm.vue";

export default {
	name: "user-remove-confirm",
	components: {
		RemoveConfirm,
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
