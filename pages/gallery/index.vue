<template>
	<v-container :style="display.stretched && 'max-width: 100%'">
		<v-row no-gutters>
			<v-col cols="12" sm="6">
				<h1 class="text-h4 my-4">
					{{ $root.lang().gallery.title }}
				</h1>
			</v-col>
			<v-col v-if="$root.isAdmin" class="ml-auto my-4" cols="12" sm="6">
				<v-btn block color="secondary" @click="clearCache">
					<v-icon left>mdi-sync</v-icon>
					{{ $root.lang().gallery.clear_cache }}
				</v-btn>
			</v-col>
		</v-row>

		<gallery-options
			:search.sync="search"
			:display.sync="display"
			:packToName="packToName"
			:maxColumns="maxColumns"
			@updateRoute="updateRoute"
		/>

		<h2 class="text-h5 my-2">{{ $root.lang().gallery.category.search }}</h2>
		<search-box
			v-model="search.search"
			:placeholder="$root.lang().database.textures.search_texture"
			@search="startSearch"
			@clear="clearSearch"
		/>

		<gallery-status-bar
			v-model="sort"
			:timer="timer"
			:length="textures.length"
			:loading="loading"
		/>

		<v-card class="main-container pa-2 text-center">
			<loading-page v-if="loading">
				{{ $root.lang().gallery.loading_message }}
			</loading-page>
			<div v-else-if="textures.length === 0" class="text-h6 my-2">
				<v-icon left>mdi-alert-circle-outline</v-icon>
				{{ error || $root.lang().global.no_results }}
			</div>
			<gallery-grid
				v-else
				:textures="textures"
				:pack="search.pack"
				:animated="display.animated"
				:sort="sort"
				:ignoreList="ignoreList"
				:discordIDtoName="discordIDtoName"
				:shownColumns="shownColumns"
				@open="openModal"
				@openNewTab="openModalInNewTab"
				@share="copyShareURL"
			/>
		</v-card>

		<gallery-modal
			v-model="modalOpen"
			:textureID="modalTextureID"
			:discordIDtoName="discordIDtoName"
			:packToName="packToName"
			:animated="display.animated"
			:ignoreList="ignoreList"
			@share="copyShareURL"
			@close="closeModal"
		/>
	</v-container>
</template>

<script>
/* global settings */
import axios from "axios";

import GalleryOptions from "./gallery-options.vue";
import GalleryStatusBar from "./gallery-status-bar.vue";
import GalleryGrid from "./gallery-grid.vue";
import GalleryModal from "./modal/index.vue";
import SearchBox from "@components/search-box.vue";
import LoadingPage from "@layouts/loading-page.vue";
import {
	ANIMATED_KEY,
	COLUMN_KEY,
	STRETCHED_KEY,
	loadDisplayOptions,
	maxGalleryColumns,
} from "@helpers/gallery";

const SORT_KEY = "gallery_sort";

const IGNORED_TEXTURES_URL =
	"https://raw.githubusercontent.com/Faithful-Resource-Pack/CompliBot/main/json/ignored_textures.json";

export default {
	name: "gallery-page",
	components: {
		GalleryOptions,
		GalleryGrid,
		GalleryModal,
		GalleryStatusBar,
		SearchBox,
		LoadingPage,
	},
	data() {
		return {
			// whether search is loading
			loading: false,
			// string error extracted
			error: undefined,
			// pretty much all gallery state
			display: loadDisplayOptions(),
			search: {
				pack: "default",
				tag: "all",
				version: "latest",
				edition: "java",
				search: null,
			},
			sort: localStorage.getItem(SORT_KEY) || "nameAsc",
			// how long a request took
			timer: {
				start: null,
				end: null,
			},
			// current results
			textures: [],
			// loaded contributors
			authors: {},
			// whether modal is open
			modalOpen: false,
			// object of pack id -> pack display name
			packToName: {},
			// for legacy url support
			legacyPackIDs: {
				"16x": "default",
				"32x": "faithful_32x",
				"64x": "faithful_64x",
				classic_faithful_32x_progart: "classic_faithful_32x",
				classic_faithful_64x_progart: "classic_faithful_64x",
			},
			// json of ignored textures (used in gallery images for fallbacks)
			ignoredTextures: {},
			abortController: new AbortController(),
		};
	},
	methods: {
		// used for both opening in a new tab and copying
		// todo: probably use URLSearchParams for this
		makeShareURL(id) {
			// vue router doesn't track base url so we need location api
			const showIndex = location.href.indexOf("?show=");
			let changedURL = location.href;
			// trim off show portion if already exists
			if (showIndex !== -1 && id !== undefined) changedURL = changedURL.slice(0, showIndex);
			if (id !== undefined) changedURL += `?show=${id}`;
			return changedURL;
		},
		copyShareURL(id) {
			const url = this.makeShareURL(id);
			navigator.clipboard.writeText(url);
			this.$root.showSnackbar(this.$root.lang().gallery.share_link_copied_to_clipboard, "success");
		},
		openModalInNewTab(id) {
			const url = this.makeShareURL(id);
			window.open(url, "_blank");
		},
		openModal(id) {
			// router watchers handle the rest
			this.$router.push({ query: { show: id } });
		},
		closeModal() {
			this.$router.push({ query: null });
		},
		discordIDtoName(d) {
			return this.authors[d]?.username || this.$root.lang().gallery.error_message.user_anonymous;
		},
		startSearch() {
			// the real search gets triggered from routing updates so we just start the route update
			this.updateRoute();
		},
		clearSearch() {
			// avoid restarting search if there's already nothing there
			if (this.search.search === null) return;
			this.search.search = null;
			this.updateRoute();
		},
		updateRoute() {
			// annoyingly the api endpoint and app route order the params differently
			const { pack, edition, version, tag, search } = this.search;
			let route = `/gallery/${edition}/${pack}/${version}/${tag}`;
			if (search) route += `/${search.replace(/ /g, "_")}`;
			if (this.modalTextureID !== undefined) route += `?show=${this.modalTextureID}`;

			if (this.$route.path === route) return; // new search is the same as before
			this.$router.push(route);
		},
		searchGallery() {
			// prevent concurrency issues
			if (this.loading) this.abortController.abort();
			// cancel request and set loading true no matter what
			this.abortController = new AbortController();
			this.loading = true;
			this.timer.start = Date.now();
			this.textures = [];

			axios
				.get(this.apiRoute, { signal: this.abortController.signal })
				.then((res) => {
					this.textures = res.data;
					this.timer.end = Date.now();
					// can't use .finally() since ERR_CANCELED doesn't update loading
					this.loading = false;
				})
				.catch((err) => {
					// new search started before old one finished, cancel
					if (err.code === "ERR_CANCELED") return;
					console.error(err);
					let message;
					if (err.response) {
						// prefer data property from api response, then status response, then generic notice
						message =
							err.response.data?.message ||
							err.response.statusText ||
							this.$root.lang().gallery.error_message.search_failed;
						this.error = `${err.response?.status}: ${message}`;
					} else {
						// todo: handle request errors better
						this.error = this.$root.lang().gallery.error_message.search_failed;
					}
					this.loading = false;
				});
		},
		clearCache() {
			this.$root
				.wrapSnackbar(axios.get(`${this.$root.apiURL}/gallery/cache/purge`, this.$root.apiOptions))
				// prevents stale results, also makes it seem like something actually happened
				.then(() => this.searchGallery());
		},
	},
	computed: {
		apiRoute() {
			// /gallery/search/{pack}/{mc_version}/{tag}
			const { pack, version, tag, search } = this.search;
			let url = `${this.$root.apiURL}/gallery/search/${pack}/${version}/${tag}`;
			if (search) url += `?search=${search}`;
			return url;
		},
		ignoreList() {
			// not loaded yet
			if (!Object.keys(this.ignoredTextures).length) return [];
			// modded is always ignored
			const ignoreList = Array.from(this.ignoredTextures.modded);
			// add all editions to ignore list
			if (this.search.edition === "all")
				ignoreList.push(...settings.editions.flatMap((edition) => this.ignoredTextures[edition]));
			else ignoreList.push(...this.ignoredTextures[this.search.edition]);
			return ignoreList;
		},
		modalTextureID() {
			return this.$route.query.show;
		},
		maxColumns() {
			return maxGalleryColumns(this.$vuetify.breakpoint);
		},
		shownColumns() {
			return Math.min(this.display.columns, this.maxColumns);
		},
	},
	watch: {
		"$route.params": {
			handler(params, prev) {
				// if query changed but not params
				if (JSON.stringify(params) === JSON.stringify(prev)) return;

				// done first so any routing updates also set everything else
				this.search.version = params.version;
				this.search.tag = params.tag;
				this.search.search = params.search;

				if (!["all", ...settings.editions].includes(params.edition)) {
					this.search.edition = "java";
					this.updateRoute();
				} else this.search.edition = params.edition;

				// convert legacy urls to modern format
				if (Object.keys(this.legacyPackIDs).includes(params.pack)) {
					this.search.pack = this.legacyPackIDs[params.pack];
					this.updateRoute();
				} else this.search.pack = params.pack;

				// wait until version/edition watcher sync has been done
				this.$nextTick(() => this.searchGallery());
			},
			deep: true,
			immediate: true,
		},
		"$route.query.show": {
			handler(params, prev) {
				if (!params || JSON.stringify(params) === JSON.stringify(prev)) return;
				this.modalOpen = true;
			},
			immediate: true,
		},
		"display.columns"(n) {
			localStorage.setItem(COLUMN_KEY, String(n));
		},
		"display.stretched"(n) {
			localStorage.setItem(STRETCHED_KEY, n);
		},
		"display.animated"(n) {
			localStorage.setItem(ANIMATED_KEY, n);
		},
		sort(n) {
			localStorage.setItem(SORT_KEY, n);
		},
	},
	created() {
		axios.get(IGNORED_TEXTURES_URL).then((res) => {
			this.ignoredTextures = res.data;
		});

		axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
			this.packToName = Object.values(res.data).reduce((acc, cur) => {
				acc[cur.id] = cur.name;
				return acc;
			}, {});
		});

		axios.get(`${this.$root.apiURL}/contributions/authors`).then((res) => {
			this.authors = res.data.reduce((acc, cur) => {
				acc[cur.id] = cur;
				return acc;
			}, {});
		});
	},
};
</script>
