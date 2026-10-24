<template>
	<v-container id="modContributionsPage">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />

		<v-dialog v-model="remove.open" max-width="500">
			<v-card v-if="remove.data">
				<v-card-title>{{ strings.delete_title }}</v-card-title>
				<v-card-text>
					{{ textureLabel(remove.data.texture_id) }} • {{ packName(remove.data.pack) }}
					<p class="text--secondary mt-2 mb-0">{{ strings.delete_hint }}</p>
				</v-card-text>
				<v-card-actions class="form-actions">
					<v-btn text @click="remove.open = false">{{ $root.lang().global.btn.cancel }}</v-btn>
					<v-btn text color="error darken-1" :loading="remove.loading" @click="confirmRemove">
						{{ $root.lang().global.btn.confirm }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-row no-gutters class="py-0 my-0" align="center">
			<v-col cols="12" sm="6">
				<h1 class="text-h4 py-4">{{ strings.title }}</h1>
			</v-col>
			<v-col cols="12" sm="6">
				<v-menu offset-y>
					<template #activator="{ on, attrs }">
						<v-btn
							block
							:color="pageColor"
							class="white--text"
							:disabled="!versionObj || !repositories.length"
							v-bind="attrs"
							v-on="on"
						>
							<v-icon left>mdi-github</v-icon>
							{{ strings.contribute }}
						</v-btn>
					</template>
					<v-list>
						<v-list-item
							v-for="item in repositories"
							:key="item.pack.id"
							:href="item.url"
							target="_blank"
							rel="noopener noreferrer"
						>
							<v-list-item-title>{{ item.pack.name }}</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12" sm="6">
				<v-autocomplete
					:value="modId"
					:items="mods"
					item-text="name"
					item-value="id"
					:label="galleryStrings.mod"
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
			<v-col cols="12" sm="6">
				<v-select
					:value="versionId"
					:items="versionItems"
					item-text="label"
					item-value="id"
					:label="galleryStrings.version"
					:color="pageColor"
					:item-color="pageColor"
					:disabled="!versions.length"
					hide-details
					@change="selectVersion"
				/>
			</v-col>
		</v-row>

		<div v-if="!mod" class="text-h6 text-center my-8">
			<v-icon left>mdi-puzzle</v-icon>
			{{ galleryStrings.select_mod }}
		</div>
		<div v-else-if="!versionsLoading && !versions.length" class="text-h6 text-center my-8">
			<v-icon left>mdi-alert-circle-outline</v-icon>
			{{ galleryStrings.no_versions }}
		</div>
		<template v-else-if="versionObj">
			<!-- Pack selection -->
			<h2 class="text-h5 my-2">{{ $root.lang().database.contributions.pack_filter }}</h2>
			<v-chip-group
				v-model="selectedPacks"
				multiple
				column
				:active-class="`${pageColor} white--text`"
			>
				<v-chip v-for="pack in modPacks" :key="pack.id" :value="pack.id" label>
					{{ pack.name }}
				</v-chip>
			</v-chip-group>

			<!-- Contribution search -->
			<h2 class="text-h5 my-2">{{ $root.lang().database.search }}</h2>
			<v-row align="stretch" class="my-2">
				<v-col cols="12" sm="6" class="pt-0 py-sm-0">
					<v-autocomplete
						v-model="selectedAuthors"
						:items="authors"
						:color="pageColor"
						:item-color="pageColor"
						:label="strings.author_filter"
						multiple
						chips
						small-chips
						deletable-chips
						outlined
						hide-details
						clearable
					/>
				</v-col>
				<v-col cols="12" sm="6" class="pb-0 py-sm-0">
					<v-text-field
						v-model="search"
						:label="$root.lang().database.contributions.texture_filter"
						:placeholder="galleryStrings.search"
						persistent-placeholder
						outlined
						type="search"
						:color="pageColor"
						hide-details
						clearable
					/>
				</v-col>
			</v-row>

			<div class="my-4 text-h5">
				{{ $root.lang().database.contributions.contribution_result }} ({{ filtered.length }})
			</div>

			<smart-grid :loading="loading" :items="filtered" wide track="id">
				<template #default="contrib">
					<v-list-item-avatar tile class="database-list-sprite">
						<a :href="galleryURL(contrib)" target="_blank" rel="noopener noreferrer">
							<v-img
								class="texture-img"
								:src="contrib.url"
								:lazy-src="$root.theme.transparencyImage"
							/>
						</a>
					</v-list-item-avatar>

					<v-list-item-content>
						<v-list-item-title>
							[#{{ contrib.texture_id }}] {{ textureLabel(contrib.texture_id) }}
						</v-list-item-title>
						<v-list-item-subtitle>
							{{ packName(contrib.pack) }} • {{ $root.formatDate(contrib.date) }} •
							<a :href="pullRequestURL(contrib)" target="_blank" rel="noopener noreferrer">
								#{{ contrib.pr }}
							</a>
						</v-list-item-subtitle>
						<v-chip-group column>
							<v-chip
								v-for="author in contrib.authors"
								:key="author"
								class="mt-0 mb-2"
								x-small
								:href="`https://github.com/${encodeURIComponent(author)}`"
								target="_blank"
								rel="noopener noreferrer"
							>
								{{ author }}
							</v-chip>
						</v-chip-group>
					</v-list-item-content>

					<v-list-item-action class="merged-actions">
						<v-btn
							icon
							:title="$root.lang().database.contributions.delete_contribution"
							@click="askRemove(contrib)"
						>
							<v-icon color="red lighten-1">mdi-delete</v-icon>
						</v-btn>
					</v-list-item-action>
				</template>
			</smart-grid>
		</template>
	</v-container>
</template>

<script>
import axios from "axios";

import ModIcon from "@components/mod-icon.vue";
import SmartGrid from "@layouts/smart-grid.vue";
import { generatePageStyles } from "@helpers/colors.js";
import {
	modContributionURL,
	modFolderURL,
	modRepository,
	modTexturePath,
} from "@helpers/modContributions";
import { filterModVersions, defaultModVersionFilters, sortModVersions } from "@helpers/modVersions";

// vanilla packs inherit their contributions from the vanilla textures
const VANILLA_PACKS = ["default", "progart"];

export default {
	name: "mod-contributions-page",
	components: { ModIcon, SmartGrid },
	data() {
		return {
			pageColor: "green darken-1",
			pageStyles: "",
			mods: [],
			modsLoading: true,
			versions: [],
			versionsLoading: false,
			packs: [],
			// empty means every pack
			selectedPacks: [],
			selectedAuthors: [],
			search: "",
			// textures of the selected version, then contributions of the textures
			textures: [],
			contributions: [],
			loading: false,
			remove: { open: false, data: null, loading: false },
		};
	},
	computed: {
		strings() {
			return this.$root.lang().mods.contributions;
		},
		galleryStrings() {
			return this.$root.lang().mods.gallery;
		},
		modId() {
			return this.$route.query.mod || null;
		},
		versionId() {
			return this.$route.query.version || null;
		},
		mod() {
			return this.mods.find((m) => m.id === this.modId);
		},
		versionObj() {
			return this.versions.find((v) => v.id === this.versionId);
		},
		versionItems() {
			return this.versions.map((v) => {
				const mc = v.minecraft;
				const range = mc.length > 1 ? `${mc[mc.length - 1]} – ${mc[0]}` : mc[0];
				return { id: v.id, label: range ? `${v.version} (${range})` : v.version };
			});
		},
		// packs that can contribute to mods
		modPacks() {
			return this.packs.filter((p) => !VANILLA_PACKS.includes(p.id));
		},
		// first location of each texture, the same asset can be used by many
		locations() {
			const out = {};
			for (const t of this.textures) out[t.texture.id] ||= `${t.namespace}/${t.path}`;
			return out;
		},
		// github pages where contributions of the selected version are made
		repositories() {
			if (!this.mod || !this.versionObj) return [];
			return this.modPacks.flatMap((pack) => {
				const repository = modRepository(pack);
				if (!repository) return [];
				return {
					pack,
					url: modFolderURL({ repository, mod: this.mod, version: this.versionObj }),
				};
			});
		},
		authors() {
			return [...new Set(this.contributions.flatMap((c) => c.authors))].sort((a, b) =>
				a.localeCompare(b),
			);
		},
		filtered() {
			const query = (this.search || "").trim().replace(/ /g, "_").toLowerCase();
			return this.contributions
				.filter(
					(c) =>
						(!this.selectedPacks.length || this.selectedPacks.includes(c.pack)) &&
						(!this.selectedAuthors.length ||
							c.authors.some((a) => this.selectedAuthors.includes(a))) &&
						(!query || (this.locations[c.texture_id] || "").toLowerCase().includes(query)),
				)
				.sort((a, b) => b.date - a.date);
		},
	},
	methods: {
		textureLabel(id) {
			return this.locations[id] || "";
		},
		packName(id) {
			return this.packs.find((p) => p.id === id)?.name || id;
		},
		galleryURL(contrib) {
			return `/mods/${this.mod.slug}/${encodeURIComponent(this.versionObj.version)}?show=${contrib.texture_id}`;
		},
		setQuery(patch) {
			const query = { ...this.$route.query, ...patch };
			for (const key of Object.keys(query)) if (!query[key]) delete query[key];
			this.$router.replace({ query });
		},
		selectMod(id) {
			this.setQuery({ mod: id, version: null });
		},
		selectVersion(id) {
			this.setQuery({ version: id });
		},
		pullRequestURL(contrib) {
			const repository = modRepository(this.packs.find((p) => p.id === contrib.pack));
			return repository
				? `https://github.com/${repository.org}/${repository.repo}/pull/${contrib.pr}`
				: undefined;
		},
		askRemove(contrib) {
			this.remove = { open: true, data: contrib, loading: false };
		},
		async confirmRemove() {
			this.remove.loading = true;
			try {
				await this.$root.wrapSnackbar(
					axios.delete(
						`${this.$root.apiURL}/mod-contributions/${this.remove.data.id}`,
						this.$root.apiOptions,
					),
				);
				this.remove.open = false;
				this.loadContributions();
			} catch {
				// already shown
			} finally {
				this.remove.loading = false;
			}
		},
		async loadMods() {
			try {
				const res = await axios.get(`${this.$root.apiURL}/mods/search`, {
					params: { blacklisted: false },
				});
				this.mods = res.data.sort((a, b) => a.name.localeCompare(b.name));
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.modsLoading = false;
			}
		},
		async loadVersions() {
			this.versions = [];
			this.textures = [];
			this.contributions = [];
			if (!this.modId) return;

			this.versionsLoading = true;
			try {
				const res = await axios.get(`${this.$root.apiURL}/mods/${this.modId}/versions`);
				this.versions = sortModVersions(res.data.filter((v) => v.status === "extracted"));
				// open the latest release by default
				const [latest] = filterModVersions(this.versions, defaultModVersionFilters());
				const fallback = latest || this.versions[0];
				if (!this.versionObj && fallback) this.setQuery({ version: fallback.id });
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.versionsLoading = false;
			}
		},
		async loadContributions() {
			this.textures = [];
			this.contributions = [];
			if (!this.mod || !this.versionObj) return;

			this.loading = true;
			const version = this.versionObj;
			try {
				const [textures, contributions] = await Promise.all([
					axios.get(`${this.$root.apiURL}/mod-versions/${version.id}/textures`),
					axios.get(`${this.$root.apiURL}/mods/${this.mod.id}/contributions`),
				]);
				this.textures = textures.data;

				// the mod's contributions of the other versions' textures are not shown
				const paths = {};
				for (const t of this.textures) paths[t.texture.id] ||= modTexturePath(t);
				this.contributions = contributions.data
					.filter((c) => paths[c.mod_texture_id])
					.map((c) => ({
						...c,
						texture_id: c.mod_texture_id,
						url: modContributionURL({
							mod: this.mod,
							version,
							packs: this.packs,
							path: paths[c.mod_texture_id],
							contribution: c,
						}),
					}));
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.loading = false;
			}
		},
	},
	watch: {
		modId: "loadVersions",
		versionObj: "loadContributions",
		// urls need the packs' repositories
		packs: "loadContributions",
	},
	created() {
		this.loadMods();
		axios
			.get(`${this.$root.apiURL}/packs/raw`)
			.then((res) => (this.packs = Object.values(res.data)))
			.catch((err) => {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			});
		this.loadVersions();
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);
	},
};
</script>
