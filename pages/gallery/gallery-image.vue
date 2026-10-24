<template>
	<div
		:class="{ 'gallery-modal-texture': modal }"
		:style="!present && { background: 'rgba(0,0,0,0.3)' }"
	>
		<!-- send click events back to caller -->
		<gallery-animation
			v-if="animated && present && hasAnimation"
			ref="animation"
			class="gallery-texture-image"
			:src="imageURL"
			:mcmeta="animation"
			:isTiled="tiled || imageURL.includes('_flow')"
			@click="$emit('click')"
			@loaded="(val) => $emit('loaded', val)"
		/>
		<img
			v-if="present"
			v-show="!hasAnimation || !animated"
			ref="imageRef"
			class="gallery-texture-image gallery-animated-image"
			:src="imageURL"
			:alt="alt"
			@click="$emit('click')"
			@error="textureNotFound"
		/>
		<div v-else class="not-done">
			<slot />
		</div>
	</div>
</template>

<script>
import axios from "axios";

import GalleryAnimation from "./gallery-animation.vue";

// separate component to track state more easily
export default {
	name: "gallery-image",
	components: {
		GalleryAnimation,
	},
	props: {
		src: {
			type: String,
			required: false,
			default: "",
		},
		// the texture is known to not exist, shows the placeholder without loading anything
		missing: {
			type: Boolean,
			required: false,
			default: false,
		},
		alt: {
			type: String,
			required: false,
			default: "",
		},
		textureID: {
			type: String,
			required: true,
		},
		animated: {
			type: Boolean,
			required: false,
			default: true,
		},
		mcmeta: {
			type: Object,
			required: false,
			default: null,
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
		// where to read the mcmeta from, defaults to the textures api
		mcmetaURL: {
			type: String,
			required: false,
			default: "",
		},
		// set to false if the texture is known to have no mcmeta to avoid a request
		fetchMcmeta: {
			type: Boolean,
			required: false,
			default: true,
		},
		// force the tiled animation, for urls that don't contain the texture name
		tiled: {
			type: Boolean,
			required: false,
			default: false,
		},
		// used to determine if the texture is animated
		animatedTextures: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	emits: ["click", "loaded"],
	data() {
		return {
			exists: true,
			imageURL: this.src,
			imageRef: null,
			hasAnimation: false,
			animation: {},
		};
	},
	methods: {
		init() {
			this.imageURL = this.src;
			this.exists = true;
			this.hasAnimation = false;
			if (this.missing) return this.$emit("loaded", false);

			const image = new Image();

			image.src = this.src;
			image.onload = () => void this.fetchAnimation();
			image.onerror = () => void this.textureNotFound();

			// always emit loaded if not animated
			if (!this.animated || !this.exists || !this.hasAnimation) this.$emit("loaded", false);
		},
		textureNotFound() {
			// fall back to default if ignored (simulates default behavior)
			// + fetch animation if it exists
			if (this.isIgnored) {
				this.imageURL = `${this.$root.apiURL}/textures/${this.textureID}/url/default/latest`;
				this.fetchAnimation();
				return;
			}

			// if not ignored, texture hasn't been made
			this.exists = false;
		},
		fetchAnimation() {
			// avoid fetching if already provided
			if (this.mcmeta && this.mcmeta.animation) {
				this.hasAnimation = true;
				this.animation = this.mcmeta;
				return;
			}

			if (!this.fetchMcmeta) {
				this.hasAnimation = false;
				return;
			}

			if (this.animatedTextures.length && !this.animatedTextures.includes(this.textureID)) {
				this.hasAnimation = false;
				return;
			}

			axios
				.get(this.mcmetaURL || `${this.$root.apiURL}/textures/${this.textureID}/mcmeta`)
				.then((res) => {
					if (res.data.animation) {
						this.hasAnimation = true;
						this.animation = res.data;
						return;
					}
					this.hasAnimation = false;
				})
				.catch((err) => {
					this.hasAnimation = false;
					console.error(err);
				});
		},
		reset() {
			this.$refs.animation?.resetCurrentTick();
		},
	},
	computed: {
		present() {
			return this.exists && !this.missing;
		},
		isIgnored() {
			return this.ignoreList.some((el) => this.src.includes(el));
		},
	},
	watch: {
		animatedTextures() {
			this.fetchAnimation();
		},
		// the image can be provided after the component is created (ex: contributions loaded later)
		src() {
			this.init();
		},
		missing() {
			this.init();
		},
	},
	created() {
		this.init();
	},
};
</script>

<style lang="scss">
.gallery-texture-image {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	object-fit: contain;
	image-rendering: pixelated;
}

.gallery-texture-image:hover,
.gallery-texture-image:active {
	cursor: pointer;
}

.gallery-animated-image {
	aspect-ratio: 1;
}

.not-done {
	// text as centered columns
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	align-items: center;
	padding: 0.25rem;
	text-align: center;
	aspect-ratio: 1;
	word-wrap: break-word;
	white-space: pre-wrap;
	word-break: break-word;
}

// makes sure content is actually centered
.not-done :last-child {
	margin-bottom: 0;
}
</style>
