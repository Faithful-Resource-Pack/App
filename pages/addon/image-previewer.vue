<template>
	<v-container :class="[empty ? 'pa-0' : 'px-0 pt-0']">
		<div class="scroller" style="overflow: auto; white-space: nowrap">
			<div class="scroller-content">
				<v-card
					class="pa-0 mr-2"
					style="display: inline-block"
					v-for="(url, index) in sources"
					:key="url"
				>
					<v-img
						class="rounded image-fullscreen-thumb"
						:src="url"
						height="150"
						:width="(150 * 16) / 9"
						:aspect-ratio="16 / 9"
						alt="preview"
						@click="onFullscreen(index)"
					/>
					<v-card
						class="ma-2"
						rounded
						style="display: inline-block; position: absolute; right: 0; top: 0"
					>
						<v-icon small class="ma-1" @click.stop="(e) => onFullscreen(index, e)">
							mdi-fullscreen
						</v-icon>
						<v-icon
							v-if="deletable"
							small
							class="ma-1"
							@click.stop="(e) => onDelete(url, index, e)"
						>
							mdi-delete
						</v-icon>
					</v-card>
				</v-card>
			</div>
		</div>

		<fullscreen-preview v-model="previewOpen" :src="fullscreenItem" />
	</v-container>
</template>

<script>
import FullscreenPreview from "@components/fullscreen-preview.vue";

export default {
	name: "image-previewer",
	components: {
		FullscreenPreview,
	},
	props: {
		sources: {
			required: true,
			type: Array,
		},
		ids: {
			required: false,
			type: Array,
			default: undefined,
		},
		deletable: {
			required: false,
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			fullscreenIndex: undefined,
			previewOpen: false,
		};
	},
	computed: {
		fullscreenItem() {
			if (this.fullscreenIndex === undefined) return "";
			return this.sources[this.fullscreenIndex];
		},
		empty() {
			return !this.sources || !this.sources.length;
		},
	},
	methods: {
		onDelete(item, index, e) {
			if (e) e.target.blur();

			if (this.ids !== undefined) this.$emit("item-delete", item, index, this.ids[index]);
			else this.$emit("item-delete", item, index, undefined);
		},
		onFullscreen(index, e) {
			if (e) e.target.blur();
			this.fullscreenIndex = index;
			this.previewOpen = true;
		},
	},
};
</script>
