<template>
	<modal-form
		v-model="modalOpen"
		danger
		:title="$root.lang().addons.remove.title"
		@close="$emit('close')"
		@submit="deleteAddon"
	>
		<v-alert v-if="review" type="warning" outlined dense>
			<h3>{{ $root.lang().addons.remove.review_title }}</h3>
			{{ $root.lang().addons.remove.review_description }}
		</v-alert>
		<p>{{ $root.lang().addons.remove.description.replace("%s", data.name) }}</p>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";

export default {
	name: "addon-remove-confirm",
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
		review: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpen: false,
		};
	},
	methods: {
		deleteAddon() {
			this.$root
				.wrapSnackbar(
					axios.delete(`${this.$root.apiURL}/addons/${this.data.id}`, this.$root.apiOptions),
				)
				.then(() => this.$emit("close", true));
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
