<template>
	<v-container :style="stretched ? 'max-width: 100% !important' : ''">
		<div class="text-h4 py-4">{{ $root.lang().gallery.title }}</div>

		<gallery-options v-model="current" :packToName="packToName" @updateRoute="updateRoute" />

		<v-row class="my-2">
			<v-col cols="12" sm="6">
				<v-slider
					:label="$root.lang('gallery.max_items_per_row')"
					v-model="columns"
					step="1"
					thumb-label
					ticks="always"
					tick-size="4"
					hide-details
					min="1"
					max="16"
				/>
			</v-col>
			<v-col cols="12" :sm="$root.isAdmin ? 3 : 6">
				<v-switch :label="$root.lang('gallery.stretched_switcher')" v-model="stretched" />
			</v-col>
			<v-col cols="12" sm="3" v-if="$root.isAdmin">
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
			:placeholder="$root.lang().database.labels.search_texture"
			type="text"
			@keyup.enter="startSearch"
			@click:append="startSearch"
			@click:clear="clearSearch"
		/>

		<v-row class="py-3 pb-0">
			<v-col cols="12" sm="9" v-if="requestTime > 0 && textures.length">
				<p class="text--secondary">
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
		<gallery-grid
			v-model="columns"
			:loading="loading"
			:stretched="stretched"
			:textures="textures"
			:pack="current.pack"
			:ignoreList="ignoreList"
			:discordIDtoName="discordIDtoName"
			:sort="currentSort"
			:error="error"
			@open="newShareURL"
			@openNewTab="newTabShareURL"
			@share="copyShareURL"
		/>

		<gallery-modal
			v-model="modalOpen"
			:textureID="modalTextureID"
			:textureObj="modalTextureObj"
			:contributors="loadedContributors"
			:packToName="packToName"
			:ignoreList="ignoreList"
			@share="copyShareURL"
			@close="removeShareURL"
		/>

		<v-btn icon large @click="toTop" v-show="scrollY > 300" class="go-up-btn">
			<v-icon>mdi-arrow-up</v-icon>
		</v-btn>
	</v-container>
</template>

<script>
/* global settings */
import axios from "axios";

import GalleryOptions from "./gallery-options.vue";
import GalleryGrid from "./gallery-grid.vue";
import GalleryModal from "./modal/main.vue";

const COLUMN_KEY = "gallery_columns";
const STRETCHED_KEY = "gallery_stretched";
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
			// number of columns you want to display
			columns: Number(localStorage.getItem(COLUMN_KEY) || 7),
			// whether search is loading
			loading: false,
			// string error extracted
			error: undefined,
			// search values
			current: {
				pack: "faithful_32x",
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
			loadedContributors: {},
			// modal opened ID
			modalTextureID: null,
			// modal texture opened
			modalTextureObj: {},
			// whether modal is opened
			modalOpen: false,
			// object of pack id -> pack display name
			packToName: {},
			// json of ignored textures (used in gallery images for fallbacks)
			ignoredTextures: {},
			// go to the top arrow
			scrollY: 0,
		};
	},
	methods: {
		resToPackID(res) {
			// for legacy url support
			switch (res) {
				case "16x":
					return "default";
				case "32x":
					return "faithful_32x";
				case "64x":
					return "faithful_64x";
			}
		},
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
		removeShareURL() {
			this.$router.push({ query: null });
		},
		copyShareURL(id) {
			const url = this.newShareURL(id, false);
			navigator.clipboard.writeText(url);
			this.$root.showSnackBar(this.$root.lang("gallery.share_link_copied_to_clipboard"), "success");
		},
		newTabShareURL(id) {
			const url = this.newShareURL(id, false);
			window.open(url, "_blank");
		},
		openModal(id) {
			this.modalTextureID = id;
			this.modalTextureObj = {}; // changes text back to loading text if reopening modal
			this.modalOpen = true;

			axios.get(`${this.$root.apiURL}/gallery/modal/${id}/${this.current.version}`).then((res) => {
				this.modalTextureObj = res.data;
			});
		},
		discordIDtoName(d) {
			return (
				this.loadedContributors[d]?.username ||
				this.$root.lang().gallery.error_message.user_anonymous
			);
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

			if (this.$route.path === route) return; // new search is the same as before
			return this.$router.push(route);
		},
		updateSearch() {
			// prevent concurrency issues
			if (this.loading) return;
			this.loading = true;
			this.timer.start = Date.now();
			this.textures = [];
			let url = `${this.$root.apiURL}/gallery/${this.current.pack}/${this.current.edition}/${this.current.version}/${
				this.current.tag
			}`;
			if (this.current.search) url += `?search=${this.current.search}`;

			// /gallery/{pack}/{edition}/{mc_version}/{tag}
			axios
				.get(url)
				.then((res) => {
					this.textures = res.data;
					this.timer.end = Date.now();
				})
				.catch((e) => {
					console.error(e);
					this.error = `${e.statusCode}: ${e.response.value}`;
				})
				.finally(() => {
					// no matter what it's not loading anymore
					this.loading = false;
				});
		},
		toTop() {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
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
			const replacePlaceholders = (msg) =>
				msg.replace("%COUNT%", this.textures.length).replace("%SECONDS%", this.requestTime);

			return replacePlaceholders(
				this.textures.length === 1
					? this.$root.lang().gallery.result_stats_singular
					: this.$root.lang().gallery.result_stats_plural,
			);
		},
		ignoreList() {
			// not loaded yet
			if (!Object.keys(this.ignoredTextures).length) return [];
			// modded is always ignored
			const ignoreList = Array.from(this.ignoredTextures.modded);
			// add all editions to ignore list
			if (this.current.edition === "all")
				ignoreList.push(
					...settings.editions.map((edition) => this.ignoredTextures[edition]).flat(),
				);
			else ignoreList.push(...this.ignoredTextures[this.current.edition]);
			return ignoreList;
		},
	},
	watch: {
		"$route.params": {
			handler(params, prev) {
				// if query changed but not params
				if (JSON.stringify(params) === JSON.stringify(prev)) return;

				this.current.version = params.version;
				this.current.edition = params.edition;
				this.current.tag = params.tag;
				this.current.search = params.search;

				// convert legacy urls to modern format
				if (["16x", "32x", "64x"].includes(params.pack)) {
					this.current.pack = this.resToPackID(params.pack);
					this.updateRoute();
				} else this.current.pack = params.pack;

				// wait until version/edition watcher sync has been done
				this.$nextTick(() => this.updateSearch());
			},
			deep: true,
			immediate: true,
		},
		"$route.query.show": {
			handler(params, prev) {
				if (!params || JSON.stringify(params) === JSON.stringify(prev)) return;
				this.openModal(params);
			},
			immediate: true,
		},
		columns(n) {
			localStorage.setItem(COLUMN_KEY, String(n));
		},
		stretched(n) {
			localStorage.setItem(STRETCHED_KEY, n);
		},
		currentSort(n) {
			localStorage.setItem(SORT_KEY, n);
		},
	},
	created() {
		axios
			.get(
				"https://raw.githubusercontent.com/Faithful-Resource-Pack/CompliBot/main/json/ignored_textures.json",
			)
			.then((res) => {
				this.ignoredTextures = res.data;
			});

		axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
			this.packToName = Object.values(res.data).reduce((acc, cur) => {
				acc[cur.id] = cur.name;
				return acc;
			}, {});
		});
		axios.get(`${this.$root.apiURL}/contributions/authors`).then((res) => {
			this.loadedContributors = res.data.reduce((acc, cur) => {
				acc[cur.id] = cur;
				return acc;
			}, {});
		});
	},
};
</script>
