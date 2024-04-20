<template>
	<v-dialog v-model="modalOpened" max-width="600">
		<v-card>
			<v-card-title class="headline">{{ $root.lang().review.deny_window.title }}</v-card-title>

			<v-card-text>
				<v-text-field
					required
					v-model="denyReason"
					:label="$root.lang().review.deny_window.label"
					:rules="reasonRules"
				/>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn color="darken-1" text @click="$emit('close', false, denyReason)">
					{{ $root.lang().global.btn.cancel }}
				</v-btn>
				<v-btn
					color="red"
					text
					:disabled="!denyReason || (denyReason && denyReason.length == 0)"
					@click="$emit('close', true, denyReason)"
				>
					{{ $root.lang().global.btn.ok }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "deny-popup",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
	},
	data() {
		return {
			modalOpened: false,
			denyReason: "",
			reasonRules: [(u) => !u || u?.length > 0 || this.$root.lang().review.deny_window.rule],
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
