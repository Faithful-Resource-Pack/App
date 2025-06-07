<template>
	<v-dialog v-model="modalOpened" :width="`${aspectRatio * 90}vh`" height="90vh">
		<v-card>
			<v-img
				:style="styles"
				:src="src"
				alt="fullscreen preview"
				:aspect-ratio="aspectRatio"
				contain
				@click="
					() => {
						modalOpened = false;
					}
				"
			/>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: "fullscreen-preview",
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		aspectRatio: {
			type: Number,
			required: false,
			default: 16 / 9,
		},
		src: {
			type: String,
			required: false,
			default: "",
		},
		texture: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	data() {
		return {
			modalOpened: false,
		};
	},
	computed: {
		styles() {
			if (!this.texture) return {};
			return {
				"image-rendering": "pixelated",
			};
		},
	},
	watch: {
		value(newValue) {
			this.modalOpened = newValue;
		},
		modalOpened(newValue) {
			this.$emit("input", newValue);
		},
	},
};
</script>
