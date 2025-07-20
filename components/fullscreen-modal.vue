<template>
	<v-dialog
		v-model="modalOpened"
		fullscreen
		hide-overlay
		content-class="colored"
		transition="dialog-bottom-transition"
		@keydown.esc="closeModal"
	>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<v-card>
			<v-toolbar>
				<v-btn icon @click.stop="closeModal">
					<v-icon>mdi-close</v-icon>
				</v-btn>
				<v-toolbar-title v-if="loading">{{ $root.lang().global.loading }}</v-toolbar-title>
				<template v-else>
					<v-toolbar-title v-if="title">{{ title }}</v-toolbar-title>
					<v-spacer v-if="$slots.toolbar" />
					<slot name="toolbar" />
				</template>
			</v-toolbar>
			<slot v-if="!loading" />
		</v-card>
	</v-dialog>
</template>

<script>
import { generatePageStyles } from "@helpers/colors.js";

export default {
	name: "fullscreen-modal",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		title: {
			type: String,
			required: false,
			default: "",
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		pageColor: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	data() {
		return {
			modalOpened: false,
			pageStyles: "",
		};
	},
	methods: {
		closeModal() {
			this.modalOpened = false;
			this.$emit("close");
		},
	},
	mounted() {
		this.pageStyles = generatePageStyles(this, this.pageColor);
	},
	watch: {
		value: {
			handler(n) {
				this.modalOpened = n;
			},
			// has issues if the modal is open on page load otherwise
			immediate: true,
		},
		modalOpened(n) {
			this.$emit("input", n);
		},
	},
};
</script>
