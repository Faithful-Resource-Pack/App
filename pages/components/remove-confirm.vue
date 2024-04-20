<template>
	<v-dialog v-model="modalOpened" content-class="colored" max-width="600">
		<v-card>
			<v-card-title class="headline">
				{{ title }}
			</v-card-title>
			<v-card-text>
				<v-form ref="form" lazy-validation>
					<slot />
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="darken-1" text @click="$emit('disableDialog')">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn color="error darken-1" text @click="onConfirm">
					{{ $root.lang().global.btn.yes }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "remove-confirm",
	props: {
		title: {
			type: String,
			required: true,
		},
		value: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
		};
	},
	methods: {
		onConfirm(data) {
			this.$emit("confirm", data);
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
