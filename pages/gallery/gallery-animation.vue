<template>
	<canvas ref="canvasRef"></canvas>
</template>

<script lang="ts">
interface Frame {
	index: number;
	frametime: number;

	/** top left */
	p0: { x: number; y: number };
	/** top right */
	p1: { x: number; y: number };
	/** bottom right */
	p2: { x: number; y: number };
	/** bottom left */
	p3: { x: number; y: number };
}

interface Animation {
	frames?: (number | { index: number; time: number })[];
	frametime?: number;
	interpolate?: boolean;
	height?: number;
	width?: number;
}

class MCMETA {
	animation: Animation = {};
}

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
			type: MCMETA,
			default: () => new MCMETA(),
		},
		/**
		 * Determine if the animation should be tiled
		 * (used for flowing fluids which are 2x2 textures)
		 */
		isTiled: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			canvasRef: null as HTMLCanvasElement | null,
			image: null as HTMLImageElement | null,
			/**
			 * Frames for the animation (not interpolated)
			 */
			frames: [] as Frame[],
			/**
			 * The drawn frames with interpolation taken into account
			 * key being the base frame index, value being an array of frames
			 * with the first frame being the base frame and the rest being
			 * the interpolated frames
			 */
			framesDrawn: {} as Record<number, { frame: Frame; alpha: number }[]>,
			currentTick: 1,
			updateCanvasTimeout: null as ReturnType<typeof setTimeout> | null,
		};
	},
	mounted() {
		this.loadImage();
	},
	beforeUnmount() {
		// clear all timeouts to prevent memory leaks
		if (this.updateCanvasTimeout) clearTimeout(this.updateCanvasTimeout);
	},
	methods: {
		loadImage(): void {
			const img = new Image();
			img.setAttribute("crossorigin", "anonymous");
			img.src = this.src;

			img.onload = () => {
				this.image = img;
				this.getFrames();
				this.updateCanvas();
			};

			img.onerror = () => {
				this.image = null;
			};
		},
		/**
		 * Use the loaded image and the given MCMETA
		 * to create the frames for the animation with the texture
		 * coordinates for each frame
		 */
		getFrames(): void {
			if (!this.image || !this.mcmeta.animation) return;

			const { animation } = this.mcmeta;

			const frames: Frame[] = [];
			const frametime = Math.min(300, animation.frametime ?? 1);

			const width = animation.width ?? this.image.width;
			const height = animation.height ?? this.image.width;

			// get the four corners of the frame
			const getPoints = (index: number): Omit<Frame, "index" | "frametime"> => {
				// when tiled, we shift the upper half left corner to the center (width/4, height/4)
				// then we shift using the index to get the right frame
				if (this.isTiled)
					return {
						p0: { x: width / 4, y: height / 4 + height * index },
						p1: { x: width / 4 + width / 2, y: height / 4 + height * index },
						p2: { x: width / 4 + width / 2, y: height / 4 + height / 2 + height * index },
						p3: { x: width / 4, y: height / 4 + height / 2 + height * index },
					};

				return {
					p0: { x: 0, y: height * index },
					p1: { x: width, y: height * index },
					p2: { x: width, y: height * (index + 1) },
					p3: { x: 0, y: height * (index + 1) },
				};
			};

			if (animation.frames) {
				for (const frame of animation.frames) {
					const partialFrame: Pick<Frame, "frametime" | "index"> = {
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

					frames.push({ ...partialFrame, ...getPoints(partialFrame.index) });
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
					frames.push({ index: frame, frametime, ...getPoints(frame) });
				}
			}

			const framesToDraw: Record<number, { frame: Frame; alpha: number }[]> = {};
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
			this.framesDrawn = framesToDraw;
		},
		updateCanvas(): void {
			if (this.frames.length === 0) return;

			// make sure the canvas is updated at most 20 times per second (50ms)
			if (this.updateCanvasTimeout) clearTimeout(this.updateCanvasTimeout);

			this.updateCanvasTimeout = setTimeout(() => {
				let next = this.currentTick + 1;
				if (this.framesDrawn[next] === undefined) next = 1;
				this.currentTick = next;

				this.updateCanvas();
			}, 1000 / 20);
		},
	},
	watch: {
		currentTick(): void {
			if (Object.keys(this.framesDrawn).length === 0) return;

			const framesDrawnAtTick = this.framesDrawn[this.currentTick];
			if (!framesDrawnAtTick) return;

			const canvas = this.$refs.canvasRef as HTMLCanvasElement | null;
			const context = canvas?.getContext("2d");

			if (!context || !canvas || !this.image) return;

			canvas.style.width = "100%";
			canvas.width = this.mcmeta.animation.width ?? canvas.offsetWidth;
			canvas.height = this.mcmeta.animation.height ?? canvas.offsetHeight;

			context.clearRect(0, 0, canvas.width, canvas.height);
			context.globalAlpha = 1;
			context.imageSmoothingEnabled = false;

			for (const frameDrawn of framesDrawnAtTick) {
				const { frame: f, alpha } = frameDrawn;
				context.globalAlpha = alpha;

				context.drawImage(
					this.image,

					// source x, source y
					f.p0.x,
					f.p0.y,
					// source width, source height
					f.p1.x - f.p0.x,
					f.p3.y - f.p0.y,

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
