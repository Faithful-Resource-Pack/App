<template>
	<canvas ref="canvasRef" @click="$emit('click')"></canvas>
</template>

<script>
const emptyMcmeta = () => ({
	animation: {},
});

export default {
	name: "gallery-animation",
	props: {
		/**
		 * The image URL for the animation
		 */
		src: {
			type: String,
			required: true,
		},
		/**
		 * The MCMETA object for the animation
		 */
		mcmeta: {
			type: Object,
			required: false,
			default: () => emptyMcmeta(),
		},
		/**
		 * Determine if the animation should be tiled
		 * (used for flowing fluids which are 2x2 textures)
		 */
		isTiled: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			canvasRef: null,
			image: null,
			/** Frames for the animation (not interpolated) */
			frames: [],
			/**
			 * The drawn frames with interpolation taken into account
			 * key being the base frame index, value being an array of frames
			 * with the first frame being the base frame and the rest being
			 * the interpolated frames
			 */
			drawnFrames: {},
			currentTick: 1,
			updateCanvasTimeout: null,
		};
	},
	mounted() {
		this.loadImage();
	},
	unmounted() {
		// clear all timeouts to prevent memory leaks
		if (this.updateCanvasTimeout) clearTimeout(this.updateCanvasTimeout);
	},
	methods: {
		loadImage() {
			const img = new Image();
			img.setAttribute("crossorigin", "anonymous");
			img.src = this.src;

			img.onload = () => {
				this.image = img;
				this.getFrames();
				this.updateCanvas();
				this.$emit("loaded", true);
			};

			img.onerror = () => {
				this.image = null;
				this.$emit("loaded", false);
			};
		},
		/**
		 * Use the loaded image and the given MCMETA
		 * to create the frames for the animation with the texture
		 * coordinates for each frame
		 */
		getFrames() {
			if (!this.image || !this.mcmeta.animation) return;

			const { animation } = this.mcmeta;

			const allFrames = [];
			const frametime = Math.min(300, animation.frametime ?? 1);

			const width = animation.width ?? this.image.width;
			const height = animation.height ?? this.image.width;

			// get the four corners of the frame
			const getPoints = (index) => {
				// when tiled, we shift the upper half left corner to the center (width/4, height/4)
				// then we shift using the index to get the right frame
				if (this.isTiled)
					return {
						topLeft: { x: width / 4, y: height / 4 + height * index },
						topRight: { x: width / 4 + width / 2, y: height / 4 + height * index },
						bottomRight: { x: width / 4 + width / 2, y: height / 4 + height / 2 + height * index },
						bottomLeft: { x: width / 4, y: height / 4 + height / 2 + height * index },
					};

				return {
					topLeft: { x: 0, y: height * index },
					topRight: { x: width, y: height * index },
					bottomRight: { x: width, y: height * (index + 1) },
					bottomLeft: { x: 0, y: height * (index + 1) },
				};
			};

			if (animation.frames) {
				for (const frame of animation.frames) {
					const partialFrame = {
						frametime: 0,
						index: 0,
					};

					switch (typeof frame) {
						case "object":
							partialFrame.index = frame.index;
							partialFrame.frametime = Math.min(300, frame.time ?? 1);
							break;
						case "number":
						default:
							partialFrame.index = frame;
							partialFrame.frametime = frametime;
							break;
					}

					allFrames.push({ ...partialFrame, ...getPoints(partialFrame.index) });
				}
			} else {
				const framesCount =
					this.image.width === height
						? // no custom size defined in mcmeta.animation.height/width
							Math.floor(this.image.height / this.image.width)
						: // custom size defined in mcmeta.animation.height/width
							// => we have to calculate the number of frames and adjust the height
							Math.floor(this.image.height / this.image.width) * (width / height);

				for (let frame = 0; frame < framesCount; frame++) {
					allFrames.push({ index: frame, frametime, ...getPoints(frame) });
				}
			}

			// filter every frame out of the image size
			const frames = allFrames.filter(
				(f) => f.topLeft.x < this.image.width && f.topLeft.y < this.image.height,
			);

			const framesToDraw = {};
			let ticks = 1;

			frames.forEach((frame, index) => {
				for (let t = 1; t <= frame.frametime; t++) {
					framesToDraw[ticks] = [{ frame, alpha: 1 }];

					if (this.mcmeta.animation.interpolate) {
						const nextFrame = frames[index + 1] ?? frames[0]; // loop back to the first frame if we're at the last frame
						framesToDraw[ticks].push({
							frame: nextFrame,
							alpha: t / frame.frametime,
						});
					}

					ticks++;
				}
			});

			this.frames = frames;
			this.drawnFrames = framesToDraw;
		},
		updateCanvas() {
			if (this.frames.length === 0) return;

			// make sure the canvas is updated at most 20 times per second (50ms)
			if (this.updateCanvasTimeout) clearTimeout(this.updateCanvasTimeout);

			this.updateCanvasTimeout = setTimeout(() => {
				let next = this.currentTick + 1;
				if (this.drawnFrames[next] === undefined) next = 1;
				this.currentTick = next;

				this.updateCanvas();
			}, 1000 / 20);
		},
		resetCurrentTick() {
			self.currentTick = 1;
		},
	},
	watch: {
		currentTick() {
			if (Object.keys(this.drawnFrames).length === 0) return;

			const framesDrawnAtTick = this.drawnFrames[this.currentTick];
			if (!framesDrawnAtTick) return;

			const canvas = this.$refs.canvasRef;
			const context = canvas?.getContext("2d");

			if (!context || !canvas || !this.image) return;

			canvas.style.width = "100%";
			canvas.width = this.mcmeta.animation.width ?? canvas.offsetWidth;
			canvas.height = this.mcmeta.animation.height ?? canvas.offsetHeight;

			context.clearRect(0, 0, canvas.width, canvas.height);
			context.globalAlpha = 1;
			context.imageSmoothingEnabled = false;

			for (const { frame, alpha } of framesDrawnAtTick) {
				context.globalAlpha = alpha;

				context.drawImage(
					this.image,
					// source x, source y
					frame.topLeft.x,
					frame.topLeft.y,
					// source width, source height
					frame.topRight.x - frame.topLeft.x,
					frame.bottomLeft.y - frame.topLeft.y,
					// dest x, dest y, dest width, dest height
					0,
					0,
					canvas.width,
					canvas.height,
				);
			}
		},
	},
};
</script>
