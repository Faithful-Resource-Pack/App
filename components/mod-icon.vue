<template>
	<!-- mod icons are always square -->
	<v-avatar tile :size="size" class="rounded">
		<v-img v-if="src" :src="src" :aspect-ratio="1" />
		<v-icon v-else :size="size * 0.6">mdi-puzzle</v-icon>
	</v-avatar>
</template>

<script>
export default {
	name: "mod-icon",
	props: {
		src: {
			type: String,
			required: false,
			default: undefined,
		},
		size: {
			type: Number,
			required: false,
			default: 40,
		},
	},
};
</script>
