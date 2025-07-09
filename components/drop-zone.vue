<template>
	<div
		class="drop-zone"
		:class="{ 'dropzone-dragging': isDragging, disabled: disabled, enabled: !disabled }"
	>
		<div
			class="dropzone-border"
			@dragover.stop="dragover"
			@dragleave.stop="dragleave"
			@drop.stop="drop"
			@click.stop="click"
		/>
		<input
			id="fileInput"
			ref="file"
			type="file"
			:multiple="multiple"
			name="file"
			class="hidden-input"
			:accept="accept"
			@change="onChange"
		/>

		<label for="fileInput" class="label">
			<div v-if="isDragging">Release to drop files here.</div>
			<div v-else>
				<slot />
			</div>
		</label>
	</div>
</template>

<script>
export default {
	name: "drop-zone",
	props: {
		accept: {
			type: String,
			required: false,
			default: () => "image/jpg, image/jpeg, image/png, image/gif",
		},
		multiple: {
			type: Boolean,
			required: false,
			default: () => false,
		},
		value: {
			type: [File, Array],
			required: false,
			default: null,
		},
		disabled: {
			type: Boolean,
			required: false,
			default: () => false,
		},
	},
	data() {
		return {
			isDragging: false,
		};
	},
	methods: {
		onChange() {
			const files = this.multiple ? Array.from(this.$refs.file.files) : this.$refs.file.files[0];
			this.$emit("change", files);
			this.$emit("input", files);
		},
		dragover(e) {
			if (this.disabled) return;

			e.preventDefault();
			this.isDragging = true;
		},
		dragleave(e) {
			if (this.disabled) return;

			e.preventDefault();
			this.isDragging = false;
		},
		/** @param {DragEvent} e */
		drop(e) {
			if (this.disabled) return;

			e.preventDefault();
			const files = e.dataTransfer.files;
			if (!Array.from(files).every((file) => this.accept.includes(file.type))) {
				this.$root.showSnackBar(this.$root.lang().addons.images.header.rules.jpeg, "error");
				this.isDragging = false;
				return;
			}
			this.$refs.file.files = e.dataTransfer.files;
			this.onChange();
			this.isDragging = false;
		},
		click() {
			if (this.disabled) return;
			this.$refs.file.click();
			this.$refs.file.blur();
		},
	},
};
</script>
