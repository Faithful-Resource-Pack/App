<template>
	<div
		:class="modal ? 'gallery-dialog-texture' : undefined"
		:style="exists ? {} : { background: 'rgba(0,0,0,0.3)' }"
	>
		<img
			v-if="exists"
			class="gallery-texture-image"
			:src="imageURL"
			style="aspect-ratio: 1"
			@error="textureNotFound"
			lazy-src="https://database.faithfulpack.net/images/bot/loading.gif"
		/>
		<div v-else class="not-done">
			<span style="height: 100%" />
			<!-- no idea why this div is needed but it is -->
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
		textureID: {
			type: String,
			required: true,
		},
		modal: {
			type: Boolean,
			required: false,
			default: false,
		},
		// saves a request on every gallery image to provide it once
		ignoreList: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	data() {
		return {
			exists: true,
			imageURL: "",
		};
	},
	methods: {
		textureNotFound() {
			if (this.ignoreList.some((el) => this.src.includes(el)))
				// fall back to default if ignored (simulates default behavior)
				this.imageURL = `${this.$root.apiURL}/textures/${this.textureID}/url/default/latest`;
			// if not ignored, texture hasn't been made
			else this.exists = false;
		},
	},
	created() {
		this.imageURL = this.src;
	},
};
</script>
