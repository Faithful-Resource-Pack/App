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
			type="file"
			:multiple="multiple"
			name="file"
			id="fileInput"
			class="hidden-input"
			@change="onChange"
			ref="file"
			:accept="accept"
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
			required: false,
			type: String,
			default: () => "image/jpg, image/jpeg, image/png, image/gif",
		},
		multiple: {
			required: false,
			type: Boolean,
			default: () => false,
		},
		value: {
			required: true,
		},
		disabled: {
			required: false,
			type: Boolean,
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
			const files = this.multiple ? [...this.$refs.file.files] : this.$refs.file.files[0];
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
		drop(e) {
			if (this.disabled) return;

			e.preventDefault();
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
