<template>
	<modal-form
		v-model="modalOpen"
		:title="title"
		:disabled="!reason || !reason.length"
		danger
		@close="interacted(false)"
		@submit="interacted(true)"
	>
		<v-alert type="warning" outlined dense>
			{{ $root.lang().addons.reason_modal.warning }}
		</v-alert>
		<p>{{ $root.lang().addons.reason_modal.description_reviewer }}</p>
		<v-textarea
			v-model="reason"
			:autofocus="!$vuetify.breakpoint.mobile"
			:color="color"
			required
			:placeholder="$root.lang().addons.reason_modal.placeholder"
		/>
	</modal-form>
</template>

<script>
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "reason-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpen: false,
			reason: "",
		};
	},
	methods: {
		interacted(submit = false) {
			this.modalOpen = false;
			this.$emit("close", submit, this.reason);
			// reset modal
			if (submit) this.reason = "";
		},
	},
	computed: {
		title() {
			return this.$root.lang().addons.reason_modal.titles[this.type].replace("%s", this.type);
		},
	},
	watch: {
		value(newValue) {
			this.modalOpen = newValue;
		},
		modalOpen(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
