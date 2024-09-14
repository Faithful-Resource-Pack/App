<template>
	<fullscreen-modal
		v-model="modalOpened"
		:loading="loading"
		:title="modalTitle"
		@close="closeModal"
	>
		<template #toolbar>
			<v-btn icon @click="$emit('share', textureID)">
				<v-icon>mdi-share-variant</v-icon>
			</v-btn>
		</template>
		<fullscreen-preview v-model="previewOpen" :src="clickedImage" :aspect-ratio="1 / 1" texture />
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
						<div
							v-for="url in group"
							class="gallery-dialog-texture-container px-2 pb-sm-2"
							:key="url.name"
						>
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
	</fullscreen-modal>
</template>

<script>
import axios from "axios";
import GalleryImage from "../gallery-image.vue";
import TextureTab from "./texture-tab.vue";
import AuthorTab from "./author-tab.vue";
import FullscreenPreview from "../../components/fullscreen-preview.vue";
import FullscreenModal from "../../components/fullscreen-modal.vue";

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
		FullscreenModal,
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
			this.textureObj = {};
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
		loading() {
			return !Object.keys(this.textureObj).length;
		},
		modalTitle() {
			if (this.loading) return this.$root.lang().global.loading;
			return `[#${this.textureID}] ${this.textureObj.texture.name}`;
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
					.get(
						// way easier to use route params than drill a version prop
						`${this.$root.apiURL}/gallery/modal/${newValue}/${this.$route.params.version || "latest"}`,
					)
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
			// has issues if the modal is open on page load otherwise
			immediate: true,
		},
		modalOpened(n) {
			this.$emit("input", n);
		},
	},
};
</script>
