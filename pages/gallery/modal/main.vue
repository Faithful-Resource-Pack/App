<template>
	<v-dialog
		v-model="modalOpened"
		fullscreen
		hide-overlay
		transition="dialog-bottom-transition"
		@keyup.esc="closeModal"
	>
		<v-card>
			<fullscreen-preview v-model="previewOpen" :src="clickedImage" :aspect-ratio="1 / 1" texture />

			<v-toolbar>
				<v-btn icon @click.stop="closeModal">
					<v-icon>mdi-close</v-icon>
				</v-btn>
				<template v-if="Object.keys(textureObj).length > 0">
					<v-toolbar-title>[#{{ textureID }}] {{ textureObj.texture.name }}</v-toolbar-title>

					<v-spacer />

					<v-btn icon @click="$emit('share', textureID)">
						<v-icon>mdi-share-variant</v-icon>
					</v-btn>
				</template>
				<template v-else>
					<v-toolbar-title>{{ $root.lang().global.loading }}</v-toolbar-title>
				</template>
			</v-toolbar>

			<div
				v-if="Object.keys(textureObj).length > 0"
				class="gallery-dialog-container d-sm-flex flex-column flex-sm-row pa-2 pa-sm-7"
			>
				<!-- image display -->
				<div
					class="gallery-dialog-textures d-sm-flex flex-row flex-sm-column overflow-auto mb-2 mb-sm-0 mx-n1 mx-sm-0"
				>
					<template v-for="group in grouped">
						<div class="d-flex flex-row pb-2 pb-sm-0">
							<template v-for="url in group">
								<div class="gallery-dialog-texture-container px-2 pb-sm-2" :key="url.name">
									<gallery-image
										modal
										:src="url.image"
										:textureID="textureID"
										:ignoreList="ignoreList"
										@click="openFullscreenPreview(url.image)"
									>
										<p>{{ $root.lang().gallery.error_message.texture_not_done }}</p>
									</gallery-image>
									<h2>{{ packToName[url.name] }}</h2>
								</div>
							</template>
						</div>
					</template>
				</div>

				<!-- texture details -->
				<div class="pl-sm-7">
					<v-tabs id="info-tabs" v-model="selectedTab" :show-arrows="false">
						<v-tabs-slider />

						<v-tab v-for="tab in tabs" :key="tab" style="text-transform: uppercase">
							{{ tab }}
						</v-tab>
					</v-tabs>

					<v-tabs-items v-model="selectedTab" class="info-table">
						<v-tab-item v-for="tab in tabs" :key="tab">
							<texture-tab v-if="tab === tabs.information" :textureObj="textureObj" />
							<author-tab
								v-if="tab === tabs.authors"
								:contributions="textureObj.contributions"
								:packToName="packToName"
								:discordIDtoName="discordIDtoName"
							/>
						</v-tab-item>
					</v-tabs-items>
				</div>
			</div>
		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios";
import GalleryImage from "../gallery-image.vue";
import TextureTab from "./texture-tab.vue";
import AuthorTab from "./author-tab.vue";
import FullscreenPreview from "../../components/fullscreen-preview.vue";

const PACK_GRID_ORDER = [
	["default", "faithful_32x", "faithful_64x"],
	["default", "classic_faithful_32x", "classic_faithful_64x"],
	["progart", "classic_faithful_32x_progart"],
];

const PACK_SLIDER_ORDER = [
	"default",
	"progart",
	"faithful_32x",
	"faithful_64x",
	"classic_faithful_32x",
	"classic_faithful_32x_progart",
	"classic_faithful_64x",
];

export default {
	name: "gallery-modal",
	components: {
		GalleryImage,
		FullscreenPreview,
		TextureTab,
		AuthorTab,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		textureID: {
			required: true,
		},
		discordIDtoName: {
			type: Function,
			required: true,
		},
		// saves on duplicate code since it's already in the gallery page
		packToName: {
			type: Object,
			required: true,
		},
		// ignore list provided (already filtered by edition)
		ignoreList: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	data() {
		return {
			textureObj: {},
			selectedTab: null,
			tabs: this.$root.lang().gallery.modal.tabs,
			modalOpened: false,
			clickedImage: "",
			previewOpen: false,
		};
	},
	methods: {
		closeModal() {
			this.$emit("close");
			this.modalOpened = false;
		},
		openFullscreenPreview(url) {
			this.clickedImage = url;
			this.previewOpen = true;
		},
	},
	computed: {
		grouped() {
			if (!this.textureObj) return [];

			// don't display duplicates on mobile
			if (this.$vuetify.breakpoint.xsOnly)
				return [
					PACK_SLIDER_ORDER.map((pack) => ({ name: pack, image: this.textureObj.urls[pack] })),
				];

			return PACK_GRID_ORDER.map((packSet) =>
				packSet.map((pack) => {
					const url = this.textureObj.urls[pack];
					return { name: pack, image: url };
				}),
			);
		},
	},
	watch: {
		textureID: {
			handler(newValue, oldValue) {
				// doesn't matter if the modal isn't open yet
				if (newValue === oldValue) return;
				if (newValue === undefined) {
					this.textureObj = {};
					return;
				}

				axios
					.get(`${this.$root.apiURL}/gallery/modal/${newValue}/latest`)
					.then((res) => {
						this.textureObj = res.data;
					})
					.catch((err) => {
						console.error(err);
						this.$root.showSnackBar(err, "error");
					});
			},
			immediate: true,
		},
		value: {
			handler(n) {
				this.modalOpened = n;
			},
			immediate: true,
		},
		modalOpened(n) {
			this.$emit("input", n);
		},
	},
};
</script>
