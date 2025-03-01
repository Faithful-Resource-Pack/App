<template>
	<div class="gallery-info">
		<h2>{{ $root.lang().gallery.modal.animation.texture_mcmeta }}</h2>
		<prism-editor
			class="my-editor"
			v-model="jsonData"
			:highlight="highlighter"
			line-numbers
			readonly
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Prism from "prismjs";
import { PrismEditor } from "vue-prism-editor";

export default defineComponent({
	name: 'AnimationTab',
	components: {
		PrismEditor,
	},
	props: {
		mcmeta: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			jsonData: JSON.stringify(this.mcmeta, null, 2),
		};
	},
	methods: {
		highlighter(code) {
			return Prism.highlight(code, Prism.languages.js, "json");
		},
	},
});
</script>