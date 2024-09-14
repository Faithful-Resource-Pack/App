<template>
	<v-dialog
		v-model="modalOpened"
		fullscreen
		hide-overlay
		transition="dialog-bottom-transition"
		@keydown.esc="closeModal"
	>
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
		},
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			modalOpened: false,
		};
	},
	methods: {
		closeModal() {
			this.$emit("close");
		},
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
