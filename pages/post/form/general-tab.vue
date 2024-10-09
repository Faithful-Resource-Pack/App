<template>
	<div>
		<div class="row">
			<div class="col pb-0">
				<v-text-field
					required
					clearable
					v-model="formData.title"
					:label="$root.lang().posts.general.title"
				/>

				<v-text-field
					required
					clearable
					v-model="formData.permalink"
					:label="$root.lang().posts.general.permalink"
					:placeholder="$root.lang().posts.general.permalink_placeholder"
					persistent-placeholder
				/>
			</div>
			<div class="col-12 col-sm-3 d-flex px-0 pt-0 align-center" v-if="formData.header_img">
				<div class="col">
					<v-img style="border-radius: 10px" :src="formData.header_img" />
				</div>
			</div>
		</div>

		<v-text-field
			required
			clearable
			v-model="formData.header_img"
			:label="$root.lang().posts.general.header_img"
			:hint="$root.lang().posts.general.header_img_hint"
		/>

		<!-- Addon description -->
		<v-textarea
			clearable
			v-model="formData.description"
			:label="$root.lang().posts.general.description"
			:hint="$root.lang().posts.general.description_hint"
			persistent-hint
		/>

		<!-- eslint-disable vue/no-v-text-v-html-on-component -->
		<v-card
			id="addon-description-preview"
			v-if="formData.description && formData.description.length > 0"
			class="pa-3"
			:elevation="0"
			v-html="sanitize(formData.description)"
		/>
		<!-- eslint-enable vue/no-v-text-v-html-on-component -->
	</div>
</template>

<script>
import DOMPurify from "dompurify";

export default {
	name: "general-tab",
	props: {
		value: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			formData: {},
		};
	},
	methods: {
		sanitize: DOMPurify.sanitize,
	},
	watch: {
		value: {
			handler(n) {
				this.formData = n;
			},
			immediate: true,
		},
		formData(n) {
			this.$emit("input", n);
		},
	},
};
</script>
