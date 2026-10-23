<template>
	<modal-form
		v-model="modalOpen"
		danger
		:title="title"
		@close="$emit('close', false)"
		@submit="remove"
	>
		<p>{{ description }}</p>
		<v-alert type="warning" outlined dense>{{ warning }}</v-alert>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";

// confirmation to delete a mod (with all its versions) or a single mod version
export default {
	name: "mod-remove-confirm",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		// "mod" or "version"
		type: {
			type: String,
			required: true,
		},
		// the mod or the mod version
		data: {
			type: Object,
			required: true,
		},
		// how many versions a deleted mod has
		versionCount: {
			type: Number,
			required: false,
			default: 0,
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpen: false,
		};
	},
	computed: {
		strings() {
			return this.$root.lang().mods.remove;
		},
		isMod() {
			return this.type === "mod";
		},
		title() {
			return this.isMod ? this.strings.mod_title : this.strings.version_title;
		},
		description() {
			return (this.isMod ? this.strings.mod_description : this.strings.version_description).replace(
				"%NAME%",
				this.isMod ? this.data.name : this.data.version,
			);
		},
		warning() {
			return this.isMod
				? this.strings.mod_warning.replace("%d", this.versionCount)
				: this.strings.version_warning;
		},
	},
	methods: {
		remove() {
			const path = this.isMod ? "mods" : "mod-versions";
			this.$root
				.wrapSnackbar(
					axios.delete(`${this.$root.apiURL}/${path}/${this.data.id}`, this.$root.apiOptions),
					this.strings.success,
				)
				.then(() => this.$emit("close", true))
				.catch(() => {});
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
