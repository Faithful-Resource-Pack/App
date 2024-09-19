<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().review.deny_window.title"
		:disabled="!denyReason || (denyReason && denyReason.length == 0)"
		@close="$emit('close', false, denyReason)"
		@submit="$emit('close', true, denyReason)"
	>
		<v-text-field
			required
			v-model="denyReason"
			:label="$root.lang().review.deny_window.label"
			:rules="reasonRules"
		/>
	</modal-form>
</template>

<script>
import ModalForm from "@components/modal-form.vue";

export default {
	name: "deny-popup",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
			denyReason: "",
			reasonRules: [(u) => !u || u?.length > 0 || this.$root.lang().review.deny_window.rule],
		};
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
