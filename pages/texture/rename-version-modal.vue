<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.textures.rename_version.title"
		danger
		button-type="confirm"
		@close="$emit('close')"
		@submit="send"
	>
		<p>{{ $root.lang().database.textures.rename_version.example }}</p>
		<v-alert type="warning" class="px-2" outlined dense>
			{{ $root.lang().database.textures.rename_version.warning }}
		</v-alert>
		<v-form ref="form" class="pt-2">
			<v-select
				v-model="form.old"
				:color="color"
				:item-color="color"
				:items="versions"
				required
				:label="$root.lang().database.textures.rename_version.current_version"
			/>
			<v-text-field
				v-model="form.new"
				:color="color"
				required
				:label="$root.lang().database.textures.rename_version.new_version"
			/>
		</v-form>
	</modal-form>
</template>

<script>
import ModalForm from "@components/modal-form.vue";
import axios from "axios";

export default {
	name: "rename-version-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		versions: {
			type: Array,
			required: false,
			default: () => [],
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	data() {
		return {
			modalOpened: false,
			form: {
				old: settings.versions.java[0],
				new: "",
			},
		};
	},
	methods: {
		send() {
			axios
				.put(
					`${this.$root.apiURL}/paths/versions/modify/${this.form.old}/${this.form.new}`,
					null,
					this.$root.apiOptions,
				)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$root.reloadSettings();
					this.$emit("close", true);
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
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
