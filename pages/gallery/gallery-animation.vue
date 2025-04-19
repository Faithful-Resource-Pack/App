<template>
	<canvas ref="canvasRef"></canvas>
</template>

<script>
export default {
	name: "gallery-animation",
	props: {
		src: {
			type: String,
			required: true,
		},
		mcmeta: {
			type: Object,
			default: () => ({ animation: {} }),
		},
		// Determine if the image is a tiled texture (used for flowing fluids which are 2x2 textures)
		isTiled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			canvasRef: null,
			image: null,
			sprites: [],
			frames: {},
			currentTick: 1,
			tickingRef: null,
			updateCanvasTimeout: null,
		};
	},
	methods: {
		loadImage() {
			const img = new Image();
			img.setAttribute("crossorigin", "anonymous");
			img.src = this.src;

			img.onload = () => {
				this.image = img;
				this.tickingRef = setInterval(() => {}, 1000 / 20);
			};

			img.onerror = () => {
				this.image = null;
				if (this.tickingRef) {
					clearInterval(this.tickingRef);
					this.tickingRef = null;
				}
			};
		},
		calculateFrames() {
			if (!this.image || !this.mcmeta) return;

			const animation = this.mcmeta.animation ?? {};
			const animationFrames = [];

			if (animation.frames) {
				for (const frame of animation.frames) {
					if (typeof frame === "object") {
						animationFrames.push({ index: frame.index, time: Math.max(frame.time, 1) });
					} else {
						animationFrames.push({ index: frame, time: animation.frametime ?? 1 });
					}
				}
			} else {
				const framesCount = this.isTiled
					? this.image.height / 2 / (this.image.width / 2)
					: this.image.height / this.image.width;
				for (let fi = 0; fi < framesCount; fi++) {
					animationFrames.push({ index: fi, time: animation.frametime ?? 1 });
				}
			}

			const framesToPlay = {};
			let ticks = 1;
			animationFrames.forEach((frame, index) => {
				for (let t = 1; t <= frame.time; t++) {
					framesToPlay[ticks] = [[frame, 1]];

					if (animation.interpolate) {
						const nextFrame = animationFrames[index + 1] ?? animationFrames[0];
						framesToPlay[ticks]?.push([nextFrame, t / nextFrame.time]);
					}

					ticks++;
				}
			});

			this.sprites = animationFrames;
			this.frames = framesToPlay;
		},
		updateCanvas() {
			if (Object.keys(this.frames).length === 0) return;

			// make sure the canvas is updated at most 20 times per second (50ms)
			if (this.updateCanvasTimeout) clearTimeout(this.updateCanvasTimeout);

			this.updateCanvasTimeout = setTimeout(() => {
				let next = this.currentTick + 1;
				if (this.frames[next] === undefined) next = 1;
				this.currentTick = next;

				this.updateCanvas();
			}, 1000 / 20);
		},
	},
	watch: {
		src() {
			return this.loadImage();
		},
		mcmeta() {
			return this.calculateFrames();
		},
		image() {
			return this.calculateFrames();
		},
		frames() {
			return this.updateCanvas();
		},
		currentTick() {
			if (Object.keys(this.frames).length === 0) return;

			const framesToDraw = this.frames[this.currentTick];
			const canvas = this.$refs.canvasRef;
			const context = canvas?.getContext("2d");

			if (!canvas || !context || !this.image || !framesToDraw) return;

			canvas.style.width = "100%";
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetWidth;

			const padding = this.isTiled ? this.image.width / 4 : 0;
			const width = this.isTiled ? this.image.width / 2 : this.image.width;

			context.clearRect(0, 0, width, width);
			context.globalAlpha = 1;
			context.imageSmoothingEnabled = false;

			for (const frame of framesToDraw) {
				const [data, alpha] = frame;
				context.globalAlpha = alpha;

				context.drawImage(
					this.image,
					padding,
					padding + width * data.index * (this.isTiled ? 2 : 1),
					width,
					width,
					0,
					0,
					canvas.width,
					canvas.width,
				);
			}
		},
	},
	mounted() {
		this.loadImage();
	},
	beforeUnmount() {
		// clear all intervals and timeouts to prevent memory leaks
		if (this.tickingRef) clearInterval(this.tickingRef);
		if (this.updateCanvasTimeout) clearTimeout(this.updateCanvasTimeout);
	},
};
</script>
