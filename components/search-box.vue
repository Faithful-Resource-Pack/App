<template>
	<!-- these specific settings are used a lot -->
	<v-text-field
		v-model="search"
		filled
		hide-details
		:color="color"
		:placeholder="placeholder"
		clearable
		clear-icon="mdi-close"
		append-icon="mdi-send"
		@keyup.enter="$emit('search')"
		@click:append="$emit('search')"
		@click:clear="$emit('clear')"
	/>
</template>

<script>
export default {
	name: "search-box",
	props: {
		value: {
			type: String,
			required: false,
			default: "",
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		placeholder: {
			type: String,
			required: false,
			default: null,
		},
	},
	data() {
		return {
			search: "",
		};
	},
	watch: {
		value: {
			handler(newValue) {
				this.search = newValue;
			},
			immediate: true,
		},
		search(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
