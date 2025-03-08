<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.textures.add_version.title"
		@close="$emit('close')"
		@submit="send"
	>
		<v-form ref="form">
			<v-select
				:color="color"
				:item-color="color"
				class="mb-0"
				:items="editions"
				v-model="form.edition"
				:placeholder="$root.lang().database.textures.add_version.new_edition"
			/>
			<v-select
				:color="color"
				:item-color="color"
				class="mb-0"
				:items="versions"
				v-model="form.version"
				:placeholder="$root.lang().database.textures.add_version.template_version"
			/>
			<v-text-field
				class="mb-0"
				:color="color"
				v-model="form.newVersion"
				:placeholder="$root.lang().database.textures.add_version.new_version"
			/>
		</v-form>
	</modal-form>
</template>

<script>
import ModalForm from "@components/modal-form.vue";
import axios from "axios";

export default {
	name: "add-version-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		editions: {
			type: Array,
			required: false,
			default: () => [],
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
				edition: "",
				version: "",
				newVersion: "",
			},
		};
	},
	methods: {
		send() {
			axios
				.post(`${this.$root.apiURL}/paths/versions/add`, this.form, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(
						this.$root.lang().database.textures.add_version.success,
						"success",
					);
					this.$emit("close");
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
			this.$nextTick(() => this.$refs.form.reset());
			this.$emit("input", newValue);
		},
	},
};
</script>
