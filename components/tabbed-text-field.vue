<template>
	<v-sheet rounded>
		<v-tabs v-model="tab" dense>
			<v-tab style="text-transform: uppercase">
				{{ $root.lang().global.text_field_tabs.write }}
			</v-tab>
			<v-tab style="text-transform: uppercase">
				{{ $root.lang().global.text_field_tabs.preview }}
			</v-tab>
		</v-tabs>
		<div class="ma-2">
			<v-tabs-items v-model="tab">
				<v-tab-item>
					<v-textarea v-model="text" auto-grow v-bind="textareaProps" />
				</v-tab-item>
				<v-tab-item>
					<!-- 120px textarea + 18px word count text -->
					<div class="my-4 mx-3" style="min-height: 138px" v-html="rendered"></div>
				</v-tab-item>
			</v-tabs-items>
		</div>
	</v-sheet>
</template>

<script>
import DOMPurify from "dompurify";

export default {
	name: "tabbed-text-field",
	props: {
		value: {
			type: String,
			required: true,
			default: "",
		},
		type: {
			type: String,
			required: false,
			// md | html
			default: "md",
		},
		textareaProps: {
			type: Object,
			required: false,
			default: () => ({}),
		},
	},
	data() {
		return {
			text: "",
			tab: null,
		};
	},
	computed: {
		rendered() {
			switch (this.type) {
				case "md":
					return this.$root.compileMarkdown(this.text);
				case "html":
				default:
					return DOMPurify.sanitize(this.text);
			}
		},
	},
	watch: {
		value(newValue) {
			this.text = newValue;
		},
		text(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
