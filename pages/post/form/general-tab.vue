<template>
	<div>
		<div class="row">
			<div class="col pb-0">
				<v-text-field
					required
					clearable
					v-model="formData.title"
					:label="$root.lang().posts.general.title.label"
					:placeholder="$root.lang().posts.general.title.placeholder"
					persistent-placeholder
				/>

				<v-text-field
					required
					clearable
					v-model="formData.permalink"
					:label="$root.lang().posts.general.permalink.label"
					:placeholder="$root.lang().posts.general.permalink.placeholder"
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
			v-model.lazy="formData.header_img"
			:label="$root.lang().posts.general.header_img.label"
			:hint="$root.lang().posts.general.header_img.hint"
			:placeholder="$root.lang().posts.general.header_img.placeholder"
			persistent-placeholder
		/>

		<div class="row">
			<div class="col pb-0">
				<v-text-field
					required
					clearable
					v-model="formData.date"
					:label="$root.lang().posts.general.date.label"
					:placeholder="$root.lang().posts.general.date.placeholder"
					persistent-placeholder
				/>
			</div>
			<div class="col-12 col-sm-3 d-flex px-0 pt-0 align-center">
				<div class="col">
					<v-checkbox
						v-model="formData.discontinued"
						:label="$root.lang().posts.general.discontinued.label"
						:hint="$root.lang().posts.general.discontinued.hint"
					/>
				</div>
			</div>
		</div>

		<tabbed-text-field
			v-model="formData.description"
			type="html"
			:textareaProps="{
				clearable: true,
				placeholder: $root.lang().posts.general.description.placeholder,
				hint: $root.lang().posts.general.description.hint,
			}"
		/>
	</div>
</template>

<script>
import TabbedTextField from "@components/tabbed-text-field.vue";

export default {
	name: "general-tab",
	components: {
		TabbedTextField,
	},
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
