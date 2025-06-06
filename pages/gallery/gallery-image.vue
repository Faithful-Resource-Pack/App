<template>
	<div
		:class="{ 'gallery-modal-texture': modal }"
		:style="!exists && { background: 'rgba(0,0,0,0.3)' }"
	>
		<!-- send click events back to caller -->
		<gallery-animation
			v-if="animated && exists && hasAnimation"
			ref="animation"
			class="gallery-texture-image"
			:src="imageURL"
			:mcmeta="animation"
			:isTiled="imageURL.includes('_flow')"
			@click="$emit('click')"
			@loaded="(val) => $emit('loaded', val)"
		/>
		<img
			v-if="exists"
			v-show="!hasAnimation || !animated"
			ref="imageRef"
			class="gallery-texture-image gallery-animated-image"
			:src="imageURL"
			lazy-src="https://database.faithfulpack.net/images/bot/loading.gif"
			@error="textureNotFound"
			@click="$emit('click')"
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
			required: true,
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
		// used to determine if the texture is animated
		animatedTextures: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
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
		textureNotFound() {
			// fall back to default if ignored (simulates default behavior)
			// + fetch animation if it exists
			if (this.ignoreList.some((el) => this.src.includes(el))) {
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

			if (this.animatedTextures.length && !this.animatedTextures.includes(this.textureID)) {
				this.hasAnimation = false;
				return;
			}

			axios
				.get(`${this.$root.apiURL}/textures/${this.textureID}/mcmeta`)
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
	watch: {
		animatedTextures() {
			this.fetchAnimation();
		},
	},
	created() {
		const image = new Image();

		image.src = this.src;
		image.onload = () => void this.fetchAnimation();
		image.onerror = () => void this.textureNotFound();

		// always emit loaded if not animated
		if (!this.animated || !this.exists || !this.hasAnimation) this.$emit("loaded", false);
	},
};
</script>
