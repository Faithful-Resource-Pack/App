<template>
	<v-container id="modGalleryPage" :style="display.stretched && 'max-width: 100%'">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />

		<h1 class="text-h4 my-4">{{ strings.title }}</h1>

		<v-row>
			<v-col cols="12" sm="6">
				<v-select
					:value="pack"
					:items="packList"
					item-text="label"
					item-value="value"
					:label="$root.lang().gallery.category.pack"
					:color="pageColor"
					:item-color="pageColor"
					hide-details
					@change="selectPack"
				/>
			</v-col>
			<v-col cols="12" sm="6">
				<v-autocomplete
					:value="id"
					:items="mods"
					item-text="name"
					item-value="id"
					:label="strings.mod"
					:color="pageColor"
					:item-color="pageColor"
					:loading="modsLoading"
					hide-details
					@change="selectMod"
				>
					<template #item="{ item }">
						<mod-icon :src="item.icon" :size="28" class="mr-3" />
						{{ item.name }}
					</template>
					<template #selection="{ item }">
						<mod-icon :src="item.icon" :size="18" class="mr-3" />
						{{ item.name }}
					</template>
				</v-autocomplete>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12" sm="6">
				<v-select
					:value="version"
					:items="versionItems"
					item-text="label"
					item-value="id"
					:label="strings.version"
					:color="pageColor"
					:item-color="pageColor"
					:disabled="!versionItems.length"
					hide-details
					@change="selectVersion"
				/>
			</v-col>
		</v-row>

		<div v-if="!slug || (!modsLoading && !mod)" class="text-h6 text-center my-8">
			<v-icon left>mdi-puzzle</v-icon>
			{{ strings.select_mod }}
		</div>
		<div v-else-if="!versionsLoading && !versions.length" class="text-h6 text-center my-8">
			<v-icon left>mdi-alert-circle-outline</v-icon>
			{{ strings.no_versions }}
		</div>
		<template v-else-if="version">
			<gallery-display-options v-model="display" :maxColumns="maxColumns" />

			<h2 class="text-h5 my-2">{{ $root.lang().gallery.category.search }}</h2>
			<search-box
				v-model="search"
				:autofocus="false"
				:placeholder="strings.search"
				:color="pageColor"
			/>

			<gallery-status-bar
				v-model="sort"
				:timer="timer"
				:length="filtered.length"
				:loading="texturesLoading"
				:methods="['nameAsc', 'nameDesc']"
			/>

			<v-card class="main-container pa-2 text-center">
				<loading-page v-if="texturesLoading">
					{{ $root.lang().gallery.loading_message }}
				</loading-page>
				<div v-else-if="filtered.length === 0" class="text-h6 my-2">
					<v-icon left>mdi-alert-circle-outline</v-icon>
					{{ $root.lang().global.no_results }}
				</div>
				<!-- same grid and image components as the main gallery so animations work as is -->
				<texture-grid
					v-else
					:items="filtered"
					:itemKey="(texture) => `${sort}${pack}${texture.key}`"
					:columns="columns"
					@click="(texture) => openModal(texture.texture.id)"
					@clickNewTab="(texture) => openModal(texture.texture.id, true)"
				>
					<template #item="{ item: texture, missingTextStyles }">
						<gallery-image
							:src="textureURL(texture)"
							:missing="!textureURL(texture)"
							:alt="texture.path"
							:textureID="texture.texture.id"
							:animated="display.animated"
							:tiled="texture.path.endsWith('_flow') || texture.path.endsWith('_flowing')"
							:mcmetaURL="mcmetaURL(texture.texture)"
							:fetchMcmeta="!!texture.texture.mcmeta"
						>
							<h1 :style="missingTextStyles.texture_id">#{{ texture.texture.id }}</h1>
							<h3 :style="missingTextStyles.texture_name">{{ filename(texture) }}</h3>
							<p :style="missingTextStyles.message">
								{{ $root.lang().gallery.error_message.texture_not_done }}
							</p>
						</gallery-image>
					</template>

					<template #tooltip="{ item: texture }">
						<mod-texture-tooltip
							:mod="mod"
							:texture="texture"
							:contribution="contributions[texture.texture.id]"
							:packSelected="!!pack"
							:userIDtoName="userIDtoName"
						/>
					</template>
				</texture-grid>
			</v-card>
		</template>

		<mod-texture-modal
			v-model="modalOpen"
			:textureId="modalTextureId"
			:textures="textures"
			:loading="texturesLoading"
			:mod="mod"
			:version="versionObj"
			:versions="versions"
			:packs="modPacks"
			:userIDtoName="userIDtoName"
			:animated="display.animated"
			:pageColor="pageColor"
			@changed="reload"
			@close="closeModal"
			@share="copyShareURL"
		/>
	</v-container>
</template>

<script>
import axios from "axios";
import TextureGrid from "@components/texture-grid.vue";
import GalleryImage from "../gallery/gallery-image.vue";
import SearchBox from "@components/search-box.vue";
import GalleryDisplayOptions from "../gallery/gallery-display-options.vue";
import GalleryStatusBar from "../gallery/gallery-status-bar.vue";
import ModIcon from "@components/mod-icon.vue";
import ModTextureTooltip from "./mod-texture-tooltip.vue";
import ModTextureModal from "./mod-texture-modal.vue";
import LoadingPage from "@layouts/loading-page.vue";
import { defaultModVersionFilters, filterModVersions, sortModVersions } from "@helpers/modVersions";
import {
	currentByTexture,
	loadModContributions,
	mcmetaURL,
	modAuthorName,
} from "@helpers/modContributions";
import { generatePageStyles } from "@helpers/colors";
import {
	ANIMATED_KEY,
	COLUMN_KEY,
	STRETCHED_KEY,
	loadDisplayOptions,
	maxGalleryColumns,
} from "@helpers/gallery";

const SORT_KEY = "mods_gallery_sort";
// vanilla packs have no modded textures (same ids as the main gallery's mojang check)
const VANILLA_PACKS = ["default", "progart"];

export default {
	name: "mod-gallery-page",
	components: {
		TextureGrid,
		GalleryImage,
		ModTextureTooltip,
		ModTextureModal,
		GalleryDisplayOptions,
		GalleryStatusBar,
		SearchBox,
		ModIcon,
		LoadingPage,
	},
	data() {
		return {
			pageColor: "teal darken-1",
			pageStyles: "",
			mods: [],
			modsLoading: true,
			versions: [],
			// versions still being imported, listed but not browsable yet
			importingVersions: [],
			versionsLoading: false,
			textures: [],
			texturesLoading: false,
			packs: [],
			// contributions of the selected pack by mod texture id
			contributions: {},
			// usernames by user id
			users: {},
			search: "",
			modalOpen: false,
			display: loadDisplayOptions(),
			sort: localStorage.getItem(SORT_KEY) === "nameDesc" ? "nameDesc" : "nameAsc",
			// how long loading textures took
			timer: { start: null, end: null },
		};
	},
	computed: {
		strings() {
			return this.$root.lang().mods.gallery;
		},
		// the url uses the mod's slug and the version's name, the api uses ids
		slug() {
			return this.$route.params.slug;
		},
		mod() {
			return this.mods.find((m) => m.slug === this.slug);
		},
		id() {
			return this.mod?.id;
		},
		versionItems() {
			const label = (v) => {
				const mc = v.minecraft;
				const range = mc.length > 1 ? `${mc[mc.length - 1]} – ${mc[0]}` : mc[0];
				return range ? `${v.version} (${range})` : v.version;
			};
			const status = this.$root.lang().mods.admin.status;
			return [
				...this.versions.map((v) => ({ id: v.id, label: label(v) })),
				...this.importingVersions.map((v) => ({
					id: v.id,
					label: `${label(v)} - ${status[v.status]}`,
					disabled: true,
				})),
			];
		},
		versionName() {
			return this.$route.params.version;
		},
		version() {
			return this.versions.find((v) => v.version === this.versionName)?.id;
		},
		// empty means the original textures of the mod
		pack() {
			return this.$route.query.pack || "";
		},
		// packs that can contribute to mods
		modPacks() {
			return this.packs.filter((p) => !VANILLA_PACKS.includes(p.id));
		},
		versionObj() {
			return this.versions.find((v) => v.id === this.version);
		},
		modalTextureId() {
			return this.$route.query.show;
		},
		packList() {
			const packs = this.modPacks.map((p) => ({ label: p.name, value: p.id }));
			return [{ label: this.strings.pack_default, value: "" }, ...packs];
		},
		columns() {
			return Math.min(this.display.columns, this.maxColumns);
		},
		maxColumns() {
			return maxGalleryColumns(this.$vuetify.breakpoint);
		},
		filtered() {
			// texture names use underscores so spaces match them like in the main gallery
			const query = this.search?.trim().toLowerCase().replace(/ /g, "_");
			// a merged texture is also found by its other names
			const out = this.textures.filter(
				(t) =>
					!query ||
					`${t.namespace}/${t.path}`.toLowerCase().includes(query) ||
					(t.texture.aliases || []).some((a) => a.toLowerCase().includes(query)),
			);
			const direction = this.sort === "nameDesc" ? -1 : 1;
			return out.sort((a, b) => direction * a.key.localeCompare(b.key));
		},
	},
	methods: {
		// keep the selected pack when switching mods or versions
		go(path) {
			this.$router.push({ path, query: this.$route.query });
		},
		selectMod(id) {
			const mod = this.mods.find((m) => m.id === id);
			this.go(mod ? `/mods/${mod.slug}` : "/mods");
		},
		selectVersion(id) {
			const version = this.versions.find((v) => v.id === id);
			this.go(`/mods/${this.slug}/${encodeURIComponent(version.version)}`);
		},
		mcmetaURL,
		// a mod texture was linked to a vanilla texture
		reload() {
			this.loadTextures();
			this.loadContributions();
		},
		openModal(id, newTab = false) {
			if (!newTab) return this.$router.push({ query: { ...this.$route.query, show: id } });
			const { href } = this.$router.resolve({ query: { ...this.$route.query, show: id } });
			window.open(href, "_blank");
		},
		closeModal() {
			const { show: _removed, ...query } = this.$route.query;
			this.$router.push({ query });
		},
		copyShareURL(id) {
			const url = new URL(location.href);
			url.searchParams.set("show", id);
			navigator.clipboard.writeText(url.href);
			this.$root.showSnackbar(this.$root.lang().gallery.share_link_copied_to_clipboard, "success");
		},
		selectPack(pack) {
			const { pack: _removed, ...query } = this.$route.query;
			this.$router.replace({ query: pack ? { ...query, pack } : query });
		},
		/** Image to show for a texture, empty if the selected pack has no contribution for it */
		textureURL(texture) {
			if (!this.pack) return texture.texture.url;
			return this.contributions[texture.texture.id]?.url || "";
		},
		/** Last part of the path, folders take too much space in the tiles */
		filename(texture) {
			return texture.path.split("/").pop();
		},
		// authors are GitHub logins, or user ids for contributions inherited from vanilla textures
		userIDtoName(id) {
			return modAuthorName(id, this.users, this.$root.lang().gallery.error_message.user_anonymous);
		},
		loadPacks() {
			axios
				.get(`${this.$root.apiURL}/packs/raw`)
				.then((res) => (this.packs = Object.values(res.data)))
				.catch((err) => {
					console.error(err);
					this.$root.showSnackbar(err, "error");
				});
		},
		async loadContributions() {
			this.contributions = {};
			const version = this.versions.find((v) => v.id === this.version);
			const mod = this.mods.find((m) => m.id === this.id);
			if (!this.pack || !version || !mod || !this.packs.length) return;

			try {
				const contributions = await loadModContributions({
					apiURL: this.$root.apiURL,
					mod,
					version,
					packs: this.packs,
					textures: this.textures,
					pack: this.pack,
				});
				this.contributions = currentByTexture(contributions);
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			}
		},
		loadMods() {
			return axios
				.get(`${this.$root.apiURL}/mods/search`, { params: { blacklisted: false } })
				.then((res) => {
					this.mods = res.data.sort((a, b) => a.name.localeCompare(b.name));
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackbar(err, "error");
				})
				.finally(() => (this.modsLoading = false));
		},
		async loadVersions() {
			this.versions = [];
			this.importingVersions = [];
			this.textures = [];
			if (!this.id) return;

			this.versionsLoading = true;
			try {
				const res = await axios.get(`${this.$root.apiURL}/mods/${this.id}/versions`);
				// versions that weren't extracted have no textures to show
				this.versions = sortModVersions(res.data.filter((v) => v.status === "extracted"));
				this.importingVersions = sortModVersions(
					res.data.filter((v) => v.status === "pending" || v.status === "extracting"),
				);
				// open the latest release by default (or the latest version if there are none)
				const [latest] = filterModVersions(this.versions, defaultModVersionFilters());
				const fallback = latest || this.versions[0];
				if (!this.version && fallback)
					this.$router.replace({
						path: `/mods/${this.slug}/${encodeURIComponent(fallback.version)}`,
						query: this.$route.query,
					});
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.versionsLoading = false;
			}
		},
		async loadTextures() {
			this.textures = [];
			this.displayed = 120;
			if (!this.version) return;

			this.texturesLoading = true;
			this.timer = { start: Date.now(), end: null };
			try {
				const res = await axios.get(`${this.$root.apiURL}/mod-versions/${this.version}/textures`);
				this.textures = res.data.map((t) => ({ ...t, key: `${t.namespace}/${t.path}` }));
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.texturesLoading = false;
				this.timer.end = Date.now();
			}
		},
	},
	watch: {
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
		"$route.query.show": {
			handler(show) {
				this.modalOpen = !!show;
			},
			immediate: true,
		},
		id: "loadVersions",
		version: "loadTextures",
		pack: "loadContributions",
		versions: "loadContributions",
		mods: "loadContributions",
		packs: "loadContributions",
		textures: "loadContributions",
	},
	created() {
		this.loadMods();
		this.loadPacks();
		axios
			.get(`${this.$root.apiURL}/users/names`)
			.then((res) => {
				this.users = Object.fromEntries(
					res.data.filter((u) => u.username).map((u) => [u.id, u.username]),
				);
			})
			.catch(console.error);
		this.loadVersions().then(this.loadTextures);
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);
	},
};
</script>
