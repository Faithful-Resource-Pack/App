<template>
	<div>
		<template v-if="addonId === undefined">
			<div
				id="preview-here"
				class="rounded-xl d-flex align-center justify-center"
				:style="{ border: '4px solid ' + color }"
			>
				<h2 class="h3">PREVIEW HERE</h2>
			</div>
		</template>
		<template v-else>
			<review-preview :addonId="addonId" />
		</template>
	</div>
</template>

<script>
import ReviewPreview from "./review-preview.vue";

export default {
	name: "review-previewer",
	components: {
		ReviewPreview,
	},
	props: {
		addonId: {
			type: String,
			required: false,
			default: undefined,
		},
		color: {
			type: String,
			required: false,
			default: "black",
		},
	},
};
</script>
