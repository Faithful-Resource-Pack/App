<template>
	<div></div>
</template>

<script>
export default {
	name: "changelog-tab",
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
