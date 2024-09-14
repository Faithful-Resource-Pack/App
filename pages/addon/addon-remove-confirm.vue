<template>
	<remove-confirm
		v-model="modalOpened"
		:title="$root.lang().addons.remove.title"
		@close="$emit('close')"
		@confirm="deleteAddon"
	>
		<p>{{ $root.lang().addons.remove.labels.question.replace("%s", data.name) }}</p>
		<p style="color: red">{{ $root.lang().addons.remove.labels.warning }}</p>
	</remove-confirm>
</template>

<script>
import axios from "axios";
import RemoveConfirm from "@components/remove-confirm.vue";

export default {
	name: "addon-remove-confirm",
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
		};
	},
	methods: {
		deleteAddon() {
			const addonID = JSON.parse(JSON.stringify(this.$props.data.id));
			axios
				.delete(`${this.$root.apiURL}/addons/${addonID}`, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close", true);
				})
				.catch((error) => {
					console.error(error);
					this.$root.showSnackBar(`${error.message} : ${error.response.data.error}`, "error");
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
