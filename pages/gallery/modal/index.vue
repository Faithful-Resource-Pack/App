<template>
	<fullscreen-modal
		v-model="modalOpen"
		:loading="loading"
		:title="title"
		:subtitle="subtitle"
		@close="closeModal"
	>
		<template #toolbar>
			<v-btn icon :title="$root.lang().gallery.share" @click="$emit('share', textureID)">
				<v-icon>mdi-share-variant</v-icon>
			</v-btn>
		</template>

		<v-container v-if="error" class="d-flex align-center justify-center flex-grow-1">
			<ascii-error :subtitle="error" :errorCode="errorCode" />
		</v-container>
		<div v-else class="gallery-modal-container pa-5 ga-2">
			<image-display
				:textureObj="textureObj"
				:loading="loading"
				:packToName="packToName"
				:animated="animated"
				:ignoreList="ignoreList"
			/>

			<!-- basis 0 so wide tab content (like the author tables) doesn't push the column under the images -->
			<div class="flex-grow-1 pa-2" style="flex-basis: 0; min-width: min(100%, 360px)">
				<v-alert v-if="isIgnored" type="info" color="secondary">
					{{ $root.lang().gallery.modal.ignored }}
				</v-alert>
				<v-tabs id="info-tabs" v-model="selectedTab" :show-arrows="false">
					<v-tabs-slider />
					<v-tab v-for="tab in displayedTabs" :key="tab">{{ tab }}</v-tab>
				</v-tabs>
				<v-tabs-items v-model="selectedTab">
					<v-tab-item v-for="tab in displayedTabs" :key="tab">
						<template v-if="loading">
							<div v-for="i in Array.from({ length: 2 }).keys()" :key="i">
								<v-skeleton-loader type="heading" class="pt-5 pb-2" />
								<!-- cool trick where each table has more rows than the last -->
								<v-skeleton-loader :type="`table-row-divider@${i + 2}`" class="mx-2 pb-5" />
							</div>
						</template>
						<texture-tab v-else-if="tab === displayedTabs.information" :textureObj="textureObj" />
						<author-tab
							v-else-if="tab === displayedTabs.authors"
							:textureID="textureObj.texture.id"
							:contributions="textureObj.contributions"
							:packToName="packToName"
							:discordIDtoName="discordIDtoName"
						/>
						<animation-tab
							v-else-if="tab === displayedTabs.animation"
							:mcmeta="textureObj.mcmeta"
						/>
					</v-tab-item>
				</v-tabs-items>
			</div>
		</div>
	</fullscreen-modal>
</template>

<script>
import axios from "axios";
import FullscreenModal from "@layouts/fullscreen-modal.vue";
import AsciiError from "@components/ascii-error.vue";

import ImageDisplay from "./image-display.vue";
import TextureTab from "./texture-tab.vue";
import AuthorTab from "./author-tab.vue";
import AnimationTab from "./animation-tab.vue";

export default {
	name: "gallery-modal",
	components: {
		FullscreenModal,
		AsciiError,
		ImageDisplay,
		TextureTab,
		AnimationTab,
		AuthorTab,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		textureID: {
			type: String,
			required: false,
			default: undefined,
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
		animated: {
			type: Boolean,
			required: false,
			default: true,
		},
		// ignore list provided (already filtered by edition)
		ignoreList: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	emits: ["input", "close", "share"],
	data() {
		return {
			textureObj: {},
			error: null,
			errorCode: undefined,
			selectedTab: null,
			modalOpen: false,
		};
	},
	methods: {
		closeModal() {
			this.$emit("close");
			this.textureObj = {};
		},
		resetModal() {
			this.textureObj = {};
			this.error = null;
		},
	},
	computed: {
		loading() {
			const hasContent = Object.keys(this.textureObj).length || this.error;
			return !hasContent;
		},
		title() {
			if (this.error) return this.$root.lang().gallery.error_message.search_failed;
			if (this.loading) return this.$root.lang().global.loading;
			return `[#${this.textureID}] ${this.textureObj.texture.name}`;
		},
		subtitle() {
			if (this.error || this.loading) return "";
			return this.textureObj.texture.tags.join(", ");
		},
		isIgnored() {
			if (this.loading) return false;
			const url = Object.values(this.textureObj.urls)[0];
			return this.ignoreList.some((el) => url.includes(el));
		},
		tabs() {
			const availableTabs = ["information", "authors"];
			if (this.loading) return availableTabs;

			// only show animation tab if there's an mcmeta
			if (Object.keys(this.textureObj.mcmeta || {}).length) availableTabs.push("animation");
			return availableTabs;
		},
		displayedTabs() {
			return this.tabs.reduce((acc, cur) => {
				acc[cur] = this.$root.lang().gallery.modal.tabs[cur];
				return acc;
			}, {});
		},
	},
	watch: {
		textureID: {
			handler(newValue, oldValue) {
				// doesn't matter if the modal isn't open yet
				if (newValue === oldValue) return;
				if (newValue === undefined) return this.resetModal();

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
						this.errorCode = err.response?.status;
						this.error =
							err.response.data?.message ||
							err.response.statusText ||
							this.$root.lang().gallery.error_message.search_failed;
					});
			},
			immediate: true,
		},
		loading(nv) {
			// not loading and there is a hash
			if (!nv && location.hash) {
				this.selectedTab = this.tabs.indexOf(location.hash.slice(1));
			}
		},
		selectedTab(nv) {
			if (this.loading) return;
			location.hash = this.tabs[nv];
		},
		value: {
			handler(n) {
				this.modalOpen = n;
			},
			// has issues if the modal is open on page load otherwise
			immediate: true,
		},
		modalOpen(n) {
			this.$emit("input", n);
		},
	},
};
</script>

<style lang="scss" src="./modal.scss"></style>
