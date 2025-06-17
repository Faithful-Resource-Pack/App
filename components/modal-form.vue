<template>
	<v-dialog v-model="modalOpened" content-class="colored" :max-width="maxWidth">
		<v-card>
			<v-card-title v-if="title" class="headline">{{ title }}</v-card-title>
			<v-card-text>
				<slot />
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn :color="danger ? normalColor : dangerColor" text @click="closeModal">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn
					:color="danger ? dangerColor : normalColor"
					:disabled="disabled"
					text
					@click="$emit('submit')"
				>
					{{ $root.lang().global.btn[buttonText] }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "modal-form",
	props: {
		title: {
			type: String,
			required: false,
			default: null,
		},
		value: {
			type: Boolean,
			required: true,
		},
		// couldn't think of better prop names
		danger: {
			type: Boolean,
			required: false,
			default: false,
		},
		buttonType: {
			type: String,
			required: false,
			default: null,
		},
		disabled: {
			type: Boolean,
			required: false,
			default: false,
		},
		maxWidth: {
			type: String,
			required: false,
			default: "600",
		},
	},
	methods: {
		closeModal() {
			this.modalOpened = false;
			this.$emit("close");
		},
	},
	computed: {
		buttonText() {
			// prioritize props
			if (this.buttonType) return this.buttonType;
			// danger needs confirmation
			if (this.danger) return "confirm";
			return "save";
		},
	},
	data() {
		return {
			modalOpened: false,
			dangerColor: "error darken-1",
			normalColor: "darken-1",
		};
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
