<template>
	<v-container :style="stretched ? 'max-width: 100% !important' : ''">
		<div class="text-h4 py-4">{{ $root.lang().gallery.title }}</div>
		<div class="my-2 text-h5">{{ $root.lang().gallery.category.search }}</div>

		<gallery-options 
			v-model="current"
			:packToName="packToName" 
			@updateRoute="updateRoute" 
		/>

		<v-row class="pl-3 mt-0">
			<v-col cols="12" :sm="stretched ? 3 : (isAbleToStretch ? 3 : 4)">
				<v-slider
					v-if="maxColumns > 2"
					hide-details
					v-model="columns"
					step="1"
					thumb-label
					ticks="always"
					tick-size="4"
					min="2"
					:max="maxColumns"
					prepend-icon="mdi-grid"
				/>
			</v-col>

			<v-col cols="12" :sm="2" p="0" v-if="isAbleToStretch">
				<v-switch :label="$root.lang().gallery.stretched_switcher" v-model="stretched" />
			</v-col>
			<v-col cols="12" :sm="isAbleToStretch ? 3 : 4" p="0" :class="this.$vuetify.breakpoint.xs ? 'py-0' : ''">
				<v-switch :label="$root.lang().gallery.animations_switcher" v-model="isPlaying" />
			</v-col>
			<v-col class="ml-auto" cols="12" :sm="isAbleToStretch ? 3 : 4" v-if="!$root.isAdmin">
				<v-btn block @click="clearCache">{{ $root.lang().gallery.clear_cache }}</v-btn>
			</v-col>
		</v-row>

		<div class="my-2 text-h5">{{ $root.lang().gallery.category.search }}</div>
		<v-text-field
			v-model="current.search"
			:append-icon="current.search ? 'mdi-send' : undefined"
			filled
			clear-icon="mdi-close"
			clearable
			hide-details
			:placeholder="$root.lang().database.textures.search_texture"
			type="text"
			@keyup.enter="startSearch"
			@click:append="startSearch"
			@click:clear="clearSearch"
		/>

		<v-row class="pb-0">
			<v-col cols="12" sm="9"v-if="requestTime > 0 && textures.length">
				<p class="text--secondary pl-2 mb-0">
					{{ resultMessage }}
				</p>
			</v-col>
			<v-col cols="12" sm="9" v-else>
				<br />
			</v-col>
			<v-col cols="12" sm="3">
				<v-select
					color="text--secondary"
					dense
					hide-details
					:items="sortMethods"
					item-text="label"
					item-value="value"
					v-model="currentSort"
				/>
			</v-col>
		</v-row>
		<!-- prop drilling mostly to save requests -->
		<gallery-grid
			v-model="columns"
			:loading="loading"
			:stretched="stretched"
			:isPlaying="isPlaying"
			:textures="textures"
			:pack="current.pack"
			:ignoreList="ignoreList"
			:animatedTextures="animatedTextures"
			:discordIDtoName="discordIDtoName"
			:sort="currentSort"
			:error="error"
			@open="newShareURL"
			@openNewTab="openModalInNewTab"
			@share="copyShareURL"
		/>

		<gallery-modal
			v-model="modalOpened"
			:textureID="modalTextureID"
			:discordIDtoName="discordIDtoName"
			:packToName="packToName"
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
import GalleryGrid from "./gallery-grid.vue";
import GalleryModal from "./modal/index.vue";

const COLUMN_KEY = "gallery_columns";
const STRETCHED_KEY = "gallery_stretched";
const ANIMATED_KEY = "gallery_animated";
const SORT_KEY = "gallery_sort";

export default {
	name: "gallery-page",
	components: {
		GalleryOptions,
		GalleryGrid,
		GalleryModal,
	},
	data() {
		const sortStrings = this.$root.lang().gallery.sort;
		return {
			// whether the page shouldn't be stretched to the full width
			stretched: localStorage.getItem(STRETCHED_KEY) === "true",
			// whether to show animated textures
			isPlaying: localStorage.getItem(ANIMATED_KEY) === "true",
			// list of animated textures ids
			animatedTextures: [],
			// number of columns you want to display
			columns: Number(localStorage.getItem(COLUMN_KEY) || 7),
			// whether search is loading
			loading: false,
			// string error extracted
			error: undefined,
			// search values
			current: {
				pack: "default",
				tag: "all",
				version: "latest",
				edition: "java",
				search: null,
			},
			sortMethods: [
				{ label: sortStrings.name_asc, value: "nameAsc" },
				{ label: sortStrings.name_desc, value: "nameDesc" },
				{ label: sortStrings.id_asc, value: "idAsc" },
				{ label: sortStrings.id_desc, value: "idDesc" },
				{ label: sortStrings.contrib_desc, value: "contribDesc" },
			],
			currentSort: localStorage.getItem(SORT_KEY) || "nameAsc",
			// how long a request took
			timer: {
				start: null,
				end: null,
			},
			// result
			textures: [],
			// loaded contributors
			authors: {},
			// whether modal is opened
			modalOpened: false,
			// object of pack id -> pack display name
			packToName: {},
			// for legacy url support
			resToPack: {
				"16x": "default",
				"32x": "faithful_32x",
				"64x": "faithful_64x",
			},
			// json of ignored textures (used in gallery images for fallbacks)
			ignoredTextures: {},
			abortController: new AbortController(),
		};
	},
	methods: {
		newShareURL(id, update = true) {
			if (update && id !== undefined) this.$router.push({ query: { show: id } });

			// need location api to get base url to share
			const showIndex = location.href.indexOf("?show=");
			let changedURL = location.href;
			// trim off show portion if already exists
			if (showIndex !== -1 && id !== undefined) changedURL = changedURL.slice(0, showIndex);
			// add new url
			if (id !== undefined) changedURL += `?show=${id}`;
			return changedURL;
		},
		copyShareURL(id) {
			const url = this.newShareURL(id, false);
			navigator.clipboard.writeText(url);
			this.$root.showSnackBar(this.$root.lang().gallery.share_link_copied_to_clipboard, "success");
		},
		openModalInNewTab(id) {
			const url = this.newShareURL(id, false);
			window.open(url, "_blank");
		},
		openModal() {
			// router has already been triggered at this point
			this.modalOpened = true;
		},
		closeModal() {
			this.$router.push({ query: null });
		},
		discordIDtoName(d) {
			return this.authors[d]?.username || this.$root.lang().gallery.error_message.user_anonymous;
		},
		startSearch() {
			this.updateRoute();
		},
		clearSearch() {
			// avoid restarting search if there's already nothing there
			if (this.current.search === null) return;
			this.current.search = null;
			this.updateRoute();
		},
		updateRoute() {
			let route = `/gallery/${this.current.edition}/${this.current.pack}/${this.current.version}/${this.current.tag}`;
			if (this.current.search) route += `/${this.current.search.replace(/ /g, "_")}`;
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
			let url = `${this.$root.apiURL}/gallery/${this.current.pack}/${this.current.edition}/${this.current.version}/${
				this.current.tag
			}`;
			if (this.current.search) url += `?search=${this.current.search}`;

			// /gallery/{pack}/{edition}/{mc_version}/{tag}
			axios
				.get(url, { signal: this.abortController.signal })
				.then((res) => {
					this.textures = res.data;
					this.timer.end = Date.now();
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
			axios
				.get(`${this.$root.apiURL}/gallery/cache/purge`, this.$root.apiOptions)
				.then(() => this.$root.showSnackBar(this.$root.lang().global.ends_success, "success"))
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	computed: {
		requestTime() {
			if (!this.timer.end || !this.timer.start) return;
			const seconds = (this.timer.end - this.timer.start) / 1000;
			// cast to number again to remove unnecessary zeros
			return Number(seconds.toFixed(2));
		},
		resultMessage() {
			const str =
				this.textures.length === 1
					? this.$root.lang().gallery.result_stats_singular
					: this.$root.lang().gallery.result_stats_plural;

			return str.replace("%COUNT%", this.textures.length).replace("%SECONDS%", this.requestTime);
		},
		ignoreList() {
			// not loaded yet
			if (!Object.keys(this.ignoredTextures).length) return [];
			// modded is always ignored
			const ignoreList = Array.from(this.ignoredTextures.modded);
			// add all editions to ignore list
			if (this.current.edition === "all")
				ignoreList.push(...settings.editions.flatMap((edition) => this.ignoredTextures[edition]));
			else ignoreList.push(...this.ignoredTextures[this.current.edition]);
			return ignoreList;
		},
		modalTextureID() {
			return this.$route.query.show;
		},
		maxColumns() {
			const { xs, sm, md, lg, xl } = this.$vuetify.breakpoint;

			// completely arbitrary values, feel free to change these
			// based on https://v2.vuetifyjs.com/en/features/breakpoints/
			if (xs) return 2;
			if (sm) return 4;
			if (md) return 8;
			if (lg) return 12;
			if (xl) return 16;
		},
		// hide the stretched switcher when the screen is smaller than the size when not stretched
		isAbleToStretch() {
			return this.$vuetify.breakpoint.width > 1056;
		},
	},
	watch: {
		"$route.params": {
			handler(params, prev) {
				// if query changed but not params
				if (JSON.stringify(params) === JSON.stringify(prev)) return;

				// done first so any routing updates also update the version/edition
				this.current.version = params.version;
				this.current.edition = params.edition;
				this.current.tag = params.tag;
				this.current.search = params.search;

				// convert legacy urls to modern format
				if (Object.keys(this.resToPack).includes(params.pack)) {
					this.current.pack = this.resToPack[params.pack];
					this.updateRoute();
				} else this.current.pack = params.pack;

				// wait until version/edition watcher sync has been done
				this.$nextTick(() => this.searchGallery());
			},
			deep: true,
			immediate: true,
		},
		"$route.query.show": {
			handler(params, prev) {
				if (!params || JSON.stringify(params) === JSON.stringify(prev)) return;
				// modal texture id is computed so we don't need to pass anything
				this.openModal();
			},
			immediate: true,
		},
		columns(n) {
			localStorage.setItem(COLUMN_KEY, String(n));
		},
		stretched(n) {
			localStorage.setItem(STRETCHED_KEY, n);
		},
		isPlaying(n) {
			localStorage.setItem(ANIMATED_KEY, n);
		},
		currentSort(n) {
			localStorage.setItem(SORT_KEY, n);
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/textures/animated`)
			.then((res) => {
				this.animatedTextures = res.data.map((el) => el.toString());
			});

		axios.get("https://raw.githubusercontent.com/Faithful-Resource-Pack/CompliBot/main/json/ignored_textures.json")
			.then((res) => {
				this.ignoredTextures = res.data;
			});

		axios.get(`${this.$root.apiURL}/packs/raw`)
			.then((res) => {
				this.packToName = Object.values(res.data).reduce((acc, cur) => {
					acc[cur.id] = cur.name;
					return acc;
				}, {});
			});

		axios.get(`${this.$root.apiURL}/contributions/authors`)
			.then((res) => {
				this.authors = res.data.reduce((acc, cur) => {
					acc[cur.id] = cur;
					return acc;
				}, {});
			});
	},
};
</script>
