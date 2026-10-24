<template>
	<fullscreen-modal
		v-model="modalOpen"
		:loading="!texture"
		:title="title"
		:subtitle="subtitle"
		:pageColor="pageColor"
		@close="$emit('close')"
	>
		<template #toolbar>
			<v-btn icon :title="$root.lang().gallery.share" @click="$emit('share', textureId)">
				<v-icon>mdi-share-variant</v-icon>
			</v-btn>
		</template>

		<v-container v-if="!loading && !texture" class="d-flex align-center justify-center flex-grow-1">
			<ascii-error :subtitle="$root.lang().mods.gallery.modal.not_found" :errorCode="404" />
		</v-container>
		<div v-else-if="texture" class="gallery-modal-container pa-5 ga-2">
			<div class="mx-auto overflow-auto pa-2">
				<!-- same layout as the main gallery: the original texture then every resolution of a pack -->
				<div
					v-for="group in imageGroups"
					:key="group[1] ? group[1].family : 'original'"
					class="d-flex flex-row pb-2 pb-sm-0"
				>
					<div v-for="image in group" :key="`${texture.id}-${image.key}`" class="px-2 pb-sm-2">
						<gallery-image
							:ref="`image-${image.key}`"
							modal
							:src="image.url"
							:missing="!image.url"
							:alt="image.name"
							:textureID="texture.id"
							:animated="animated"
							:mcmetaURL="mcmetaURL(texture)"
							:fetchMcmeta="!!texture.mcmeta"
							:tiled="isTiled"
							@click="openPreview(image.url)"
							@loaded="countLoaded"
						>
							<p>{{ $root.lang().gallery.error_message.texture_not_done }}</p>
						</gallery-image>
						<h2 class="text-center gallery-modal-caption mt-1">{{ image.name }}</h2>
					</div>
				</div>
			</div>

			<!-- basis 0 so wide tab content (like the author tables) doesn't push the column under the images -->
			<div class="flex-grow-1 pa-2" style="flex-basis: 0; min-width: min(100%, 360px)">
				<v-tabs v-model="selectedTab" :show-arrows="false" :color="pageColor">
					<v-tabs-slider />
					<v-tab v-for="tab in tabs" :key="tab">{{ tabNames[tab] }}</v-tab>
				</v-tabs>
				<v-tabs-items v-model="selectedTab">
					<v-tab-item v-for="tab in tabs" :key="tab">
						<!-- eslint-disable vue/valid-v-slot -->
						<div v-if="tab === 'information'" class="py-3">
							<h2 class="text-h5 mb-3">{{ $root.lang().gallery.modal.info.texture }}</h2>
							<v-alert v-if="inheritedBlacklist" dense text type="warning" class="mb-3">
								{{ inheritedBlacklist }}
							</v-alert>
							<v-simple-table dense>
								<tbody>
									<tr v-for="row in info" :key="row.label">
										<td>{{ row.label }}</td>
										<td v-if="row.key === 'vanilla' && $root.isAdmin">
											<div class="d-flex align-center py-1" style="gap: 8px">
												<v-text-field
													v-model="vanillaInput"
													type="number"
													dense
													hide-details
													single-line
													:placeholder="strings.vanilla_label"
													:color="pageColor"
													@keydown.enter="linkVanilla(Number(vanillaInput))"
												/>
												<v-btn
													small
													:color="pageColor"
													class="white--text"
													:disabled="!vanillaInput"
													@click="linkVanilla(Number(vanillaInput))"
												>
													{{ strings.link }}
												</v-btn>
												<v-btn v-if="texture.vanilla_id" small outlined @click="linkVanilla(null)">
													{{ strings.unlink }}
												</v-btn>
											</div>
										</td>
										<td v-else-if="row.key === 'aliases' && $root.isAdmin">
											<div class="d-flex align-center py-1" style="gap: 8px">
												<v-combobox
													v-model="aliasesInput"
													:color="pageColor"
													:item-color="pageColor"
													:hint="strings.aliases_hint"
													multiple
													small-chips
													deletable-chips
													append-icon=""
													dense
													persistent-hint
													@keydown.enter.prevent
												/>
												<v-btn
													small
													:color="pageColor"
													class="white--text"
													:disabled="!aliasesChanged"
													@click="saveAliases"
												>
													{{ strings.aliases_save }}
												</v-btn>
											</div>
										</td>
										<td v-else class="text-break">{{ row.value }}</td>
									</tr>
									<tr v-if="$root.isAdmin">
										<td>{{ strings.blacklisted }}</td>
										<td>
											<v-switch
												:input-value="!!texture.blacklisted"
												:title="strings.blacklisted_hint"
												:color="pageColor"
												class="mt-0 pt-0"
												dense
												hide-details
												inset
												@change="setBlacklisted"
											/>
										</td>
									</tr>
								</tbody>
							</v-simple-table>
							<h2 class="text-h5 mt-5 mb-3">{{ $root.lang().gallery.modal.info.paths }}</h2>
							<v-data-table
								dense
								:headers="pathHeaders"
								:items="entries"
								hide-default-footer
								disable-pagination
							/>
						</div>
						<div v-else-if="tab === 'authors'" class="py-3">
							<v-row :dense="$vuetify.breakpoint.lg">
								<v-col v-for="pack in packs" :key="pack.id" cols="12" sm="6">
									<h3 class="uppercase text--secondary my-2">{{ pack.name }}</h3>
									<v-data-table
										dense
										:headers="authorHeaders"
										:items="contributionsOf(pack.id)"
										hide-default-footer
										disable-pagination
										:no-data-text="$root.lang().gallery.modal.no_contributions"
									/>
								</v-col>
							</v-row>
						</div>
						<animation-tab v-else-if="tab === 'animation'" :mcmeta="mcmeta" />
						<!-- eslint-enable vue/valid-v-slot -->
					</v-tab-item>
				</v-tabs-items>
			</div>
		</div>

		<fullscreen-preview v-model="previewOpen" :src="previewURL" :aspect-ratio="1 / 1" texture />
	</fullscreen-modal>
</template>

<script>
import axios from "axios";
import FullscreenModal from "@layouts/fullscreen-modal.vue";
import AsciiError from "@components/ascii-error.vue";
import FullscreenPreview from "@components/fullscreen-preview.vue";
import GalleryImage from "../gallery/gallery-image.vue";
import AnimationTab from "../gallery/modal/animation-tab.vue";
import { loadModContributions, mcmetaURL, modTexturePath } from "@helpers/modContributions";

/** Pack id without its resolution (ex: faithful_32x -> faithful) */
const familyOf = (pack) => pack.id.replace(/_\d+x/, "");

export default {
	name: "mod-texture-modal",
	components: { FullscreenModal, AsciiError, FullscreenPreview, GalleryImage, AnimationTab },
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		textureId: {
			type: String,
			required: false,
			default: undefined,
		},
		// every texture of the mod version (a texture can be used by several paths)
		textures: {
			type: Array,
			required: true,
		},
		mod: {
			type: Object,
			required: false,
			default: undefined,
		},
		version: {
			type: Object,
			required: false,
			default: undefined,
		},
		// every extracted version of the mod, newest first
		versions: {
			type: Array,
			required: true,
		},
		// packs that can contribute to mods, in the order of the packs collection
		packs: {
			type: Array,
			required: true,
		},
		// the textures of the version are still loading
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
		userIDtoName: {
			type: Function,
			required: true,
		},
		animated: {
			type: Boolean,
			required: false,
			default: true,
		},
		pageColor: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input", "close", "share", "changed"],
	data() {
		return {
			modalOpen: false,
			selectedTab: null,
			contributions: [],
			versionIds: [],
			vanillaInput: "",
			aliasesInput: [],
			mcmeta: null,
			previewOpen: false,
			previewURL: "",
			loadedTimeout: undefined,
		};
	},
	computed: {
		strings() {
			return this.$root.lang().mods.gallery.modal;
		},
		entries() {
			return (
				this.textures
					.filter((t) => t.texture.id === this.textureId)
					// full path in the mod's jar (and in the contribution repositories)
					.map((t) => ({ path: modTexturePath(t) }))
			);
		},
		texture() {
			return this.textures.find((t) => t.texture.id === this.textureId)?.texture;
		},
		title() {
			if (!this.texture) return "";
			return `[#${this.texture.id}] ${this.entries[0].path
				.split("/")
				.pop()
				.replace(/\.png$/, "")}`;
		},
		subtitle() {
			if (!this.mod) return "";
			return `${this.mod.name} ${this.versionNames.join(", ")}`.trim();
		},
		// every version of the mod containing the texture, newest first
		supportedVersions() {
			const byId = new Set(this.versionIds);
			const found = this.versions.filter((v) => byId.has(v.id));
			// until the request is done only the opened version is known
			return found.length ? found : this.versions.filter((v) => v.id === this.version?.id);
		},
		versionNames() {
			return this.supportedVersions.map((v) => v.version);
		},
		// the mod and the version are checked too: a texture accepts contributions only if none is blacklisted
		inheritedBlacklist() {
			if (this.mod?.blacklisted) return this.strings.mod_blacklisted;
			if (this.version?.blacklisted) return this.strings.version_blacklisted;
			return "";
		},
		isTiled() {
			return this.entries.some(
				(e) => e.path.endsWith("_flow.png") || e.path.endsWith("_flowing.png"),
			);
		},
		tabs() {
			return this.mcmeta?.animation
				? ["information", "authors", "animation"]
				: ["information", "authors"];
		},
		tabNames() {
			return this.$root.lang().gallery.modal.tabs;
		},
		// one row per pack family (ex: Faithful 32x and 64x), or a single row on small screens
		imageGroups() {
			const original = { key: "original", name: this.mod?.name || "", url: this.texture.url };
			const images = this.packs.map((pack) => ({
				key: pack.id,
				family: familyOf(pack),
				name: pack.name,
				url: this.currentContribution(pack.id)?.url || "",
			}));
			if (this.$vuetify.breakpoint.mdAndDown) return [[original, ...images]];

			// packs are in the order of the packs collection, so the groups keep it
			const families = {};
			for (const image of images) (families[image.family] ||= []).push(image);
			return Object.values(families).map((group) => [original, ...group]);
		},
		info() {
			const { id, width, height, animated, hash, merged_hashes, aliases, vanilla_id } =
				this.texture;
			const data = this.$root.lang().gallery.modal.data;
			return [
				{ label: this.strings.versions, value: this.versionNames.join(", ") },
				{
					key: "vanilla",
					label: this.strings.vanilla,
					value: vanilla_id ? `#${vanilla_id}` : this.strings.vanilla_none,
				},
				{ label: data.texture_id, value: id },
				{ label: this.strings.size, value: `${width}×${height}` },
				{ label: this.strings.animated, value: animated ? "✔" : "✘" },
				// only admins can edit the names, the others see them when there are some
				...(this.$root.isAdmin || aliases?.length
					? [{ key: "aliases", label: this.strings.aliases, value: (aliases || []).join(", ") }]
					: []),
				{ label: "SHA-256", value: hash },
				...(merged_hashes?.length
					? [{ label: this.strings.merged_hashes, value: merged_hashes.join(", ") }]
					: []),
			];
		},
		aliasesChanged() {
			const saved = this.texture?.aliases || [];
			return (
				this.aliasesInput.length !== saved.length ||
				this.aliasesInput.some((a, i) => a !== saved[i])
			);
		},
		pathHeaders() {
			return [{ text: this.$root.lang().gallery.modal.data.resource_pack_path, value: "path" }];
		},
		authorHeaders() {
			const data = this.$root.lang().gallery.modal.data;
			return [
				{ text: data.date, value: "date" },
				{ text: data.authors, value: "authors" },
				{ text: this.strings.source, value: "source" },
			];
		},
	},
	methods: {
		mcmetaURL,
		// contributions are sorted with the latest first
		currentContribution(packId) {
			return this.contributions.find((c) => c.pack === packId);
		},
		contributionsOf(packId) {
			return this.contributions
				.filter((c) => c.pack === packId)
				.sort((a, b) => b.date - a.date)
				.map((c) => ({
					date: this.$root.formatDate(c.date),
					authors: c.authors.map((id) => this.userIDtoName(id)).join(", "),
					source: c.inherited
						? this.strings.statuses.vanilla.replace("%ID%", c.vanilla_id)
						: `#${c.pr}`,
				}));
		},
		openPreview(url) {
			if (!url) return;
			this.previewURL = url;
			this.previewOpen = true;
		},
		countLoaded(loaded) {
			if (!loaded) return;

			// reset the other frames until synced
			clearTimeout(this.loadedTimeout);
			this.loadedTimeout = setTimeout(() => {
				const refs = Object.values(this.$refs)
					.flat()
					.filter((ref) => ref && ref.reset);
				Promise.all(refs.flatMap((ref) => ref.reset()));
			}, 100);
		},
		async load() {
			this.contributions = [];
			this.versionIds = [];
			this.vanillaInput = this.texture?.vanilla_id ? String(this.texture.vanilla_id) : "";
			this.aliasesInput = [...(this.texture?.aliases || [])];
			this.mcmeta = this.texture?.mcmeta || null;
			this.selectedTab = 0;
			if (!this.texture) return;

			if (!this.mod || !this.version) return;

			axios
				.get(`${this.$root.apiURL}/mods/${this.mod.id}/textures/${this.texture.id}/versions`)
				.then((res) => (this.versionIds = res.data))
				.catch(console.error);

			try {
				this.contributions = await loadModContributions({
					apiURL: this.$root.apiURL,
					mod: this.mod,
					version: this.version,
					packs: this.packs,
					textures: this.textures,
					textureId: this.texture.id,
				});
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			}
		},
		async setBlacklisted(blacklisted) {
			try {
				await axios.put(
					`${this.$root.apiURL}/mod-textures/${this.texture.id}`,
					{ blacklisted },
					this.$root.apiOptions,
				);
				this.$root.showSnackbar(this.strings.blacklist_success, "success");
				this.$emit("changed");
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			}
		},
		async saveAliases() {
			try {
				await axios.put(
					`${this.$root.apiURL}/mod-textures/${this.texture.id}/aliases`,
					{ aliases: this.aliasesInput.map((a) => a.trim()).filter(Boolean) },
					this.$root.apiOptions,
				);
				this.$root.showSnackbar(this.strings.aliases_success, "success");
				this.$emit("changed");
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			}
		},
		async linkVanilla(vanillaId) {
			try {
				await axios.put(
					`${this.$root.apiURL}/mod-textures/${this.texture.id}/vanilla`,
					{ texture_id: vanillaId },
					this.$root.apiOptions,
				);
				this.$root.showSnackbar(
					vanillaId === null ? this.strings.unlink_success : this.strings.link_success,
					"success",
				);
				// the version's textures and contributions need to be fetched again
				this.$emit("changed");
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			}
		},
	},
	watch: {
		value: {
			handler(n) {
				this.modalOpen = n;
			},
			immediate: true,
		},
		modalOpen(n) {
			this.$emit("input", n);
		},
		// the texture only exists once the version's textures are loaded
		texture: {
			handler: "load",
			immediate: true,
		},
	},
};
</script>
