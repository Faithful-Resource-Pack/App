<template>
	<div
		:class="modal ? 'gallery-dialog-texture' : ''"
		:style="exists ? {} : { background: 'rgba(0,0,0,0.3)' }"
	>
		<img
			v-if="exists"
			class="gallery-texture-image"
			:src="src"
			style="aspect-ratio: 1"
			@error="() => (exists = false)"
			lazy-src="https://database.faithfulpack.net/images/bot/loading.gif"
		/>
		<div v-else class="not-done">
			<span />
			<div>
				<slot />
			</div>
		</div>
	</div>
</template>

<script>

// separate component to track state more easily
export default {
	name: "gallery-image",
	props: {
		src: {
			type: String,
			required: true,
		},
		modal: {
			type: Boolean,
			required: false,
		},
	},
	data() {
		return {
			exists: true,
		};
	},
};
</script>
