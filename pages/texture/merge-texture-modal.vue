<template>
	<modal-form
		v-model="modalOpened"
		:title="$root.lang().database.textures.merge_textures.title"
		:disabled="formIncomplete"
		danger
		button-type="confirm"
		@close="$emit('close')"
		@submit="send"
	>
		<v-alert type="warning" class="px-2" outlined dense>
			{{ $root.lang().database.textures.merge_textures.warning }}
		</v-alert>
		<v-form ref="form" class="pt-2">
			<v-row>
				<v-col>
					<v-text-field
						v-model="srcTextureID"
						:color="color"
						required
						type="number"
						:label="$root.lang().database.textures.merge_textures.source"
						:hint="srcPreview"
						persistent-hint
						@change="updateSrc"
					/>
				</v-col>
				<v-col>
					<v-text-field
						v-model="destTextureID"
						:color="color"
						required
						type="number"
						:label="$root.lang().database.textures.merge_textures.destination"
						:hint="destPreview"
						persistent-hint
						@change="updateDest"
					/>
				</v-col>
			</v-row>
		</v-form>
	</modal-form>
</template>

<script>
import ModalForm from "@components/modal-form.vue";
import axios from "axios";

export default {
	name: "merge-texture-modal",
	components: {
		ModalForm,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
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
			srcTextureID: null,
			srcData: null,
			destTextureID: null,
			destData: null,
		};
	},
	methods: {
		async getTextureData(id) {
			if (id === null) return null;
			try {
				const res = await axios.get(`${this.$root.apiURL}/textures/${id}`);
				return res.data;
			} catch {
				// reject with error property
				return { error: this.$root.lang().database.textures.merge_textures.invalid_id };
			}
		},
		// separate update methods to debounce the input (only updated on change rather than on input)
		async updateSrc() {
			this.srcData = await this.getTextureData(this.srcTextureID);
		},
		async updateDest() {
			this.destData = await this.getTextureData(this.destTextureID);
		},
		createPreview(data) {
			if (data === null) return "";
			if (data.error) return data.error;
			return `${data.name} (${data.tags.join(", ")})`;
		},
		send() {
			// /textures/merge/{add_id}/{remove_id} (destination goes first)
			axios
				.put(
					`${this.$root.apiURL}/textures/merge/${this.destTextureID}/${this.srcTextureID}`,
					null,
					this.$root.apiOptions,
				)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.$emit("close");
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
					this.$emit("close");
				});
		},
	},
	computed: {
		srcPreview() {
			return this.createPreview(this.srcData);
		},
		destPreview() {
			return this.createPreview(this.destData);
		},
		formIncomplete() {
			return this.srcTextureID === null || this.destTextureID === null;
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
