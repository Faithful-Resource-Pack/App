<template>
	<v-container id="modsAdminPage">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />

		<import-modal
			v-model="importOpen"
			:mods="mods"
			:mod="importMod"
			:existingVersions="versions"
			:color="pageColor"
			@close="onImported"
		/>

		<v-row no-gutters class="py-0 mb-0" align="center">
			<v-col cols="12" sm="6">
				<h1 class="text-h4 py-4">{{ strings.title }}</h1>
			</v-col>
			<v-col cols="12" sm="6">
				<v-btn block :color="pageColor" class="white--text" @click="openImport">
					<v-icon left>mdi-plus</v-icon>
					{{ strings.import }}
				</v-btn>
			</v-col>
		</v-row>

		<search-box
			v-model="search"
			:autofocus="false"
			:label="$root.lang().database.search"
			class="my-2"
		/>

		<smart-grid :loading="loading" :items="filtered" wide track="id">
			<template #default="mod">
				<v-list-item-avatar tile class="database-list-avatar rounded">
					<mod-icon :src="mod.icon" :size="48" />
				</v-list-item-avatar>
				<v-list-item-content>
					<v-list-item-title>{{ mod.name }}</v-list-item-title>
					<v-list-item-subtitle class="d-flex align-center">
						<platform-icon
							v-if="mod.providers?.curseforge"
							platform="curseforge"
							:size="16"
							class="mr-1"
						/>
						<platform-icon
							v-if="mod.providers?.modrinth"
							platform="modrinth"
							:size="16"
							class="mr-1"
						/>
						{{ mod.slug }}
						<v-chip v-if="mod.blacklisted" x-small label class="ml-2">
							{{ strings.blacklisted }}
						</v-chip>
					</v-list-item-subtitle>
				</v-list-item-content>
				<v-list-item-action class="merged-actions">
					<v-btn icon :title="strings.versions" @click="toggle(mod.id)">
						<v-icon>{{ opened === mod.id ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
					</v-btn>
				</v-list-item-action>
			</template>
		</smart-grid>

		<v-dialog :value="!!opened" max-width="800" @input="opened = null">
			<v-card v-if="openedMod">
				<v-card-title class="justify-space-between">
					<div class="d-flex align-center">
						<mod-icon :src="openedMod.icon" :size="40" class="mr-3" />
						{{ openedMod.name }}
						<platform-icon
							v-if="openedMod.providers?.curseforge"
							platform="curseforge"
							:size="20"
							class="ml-3"
						/>
						<platform-icon
							v-if="openedMod.providers?.modrinth"
							platform="modrinth"
							:size="20"
							class="ml-2"
						/>
					</div>
					<v-btn icon @click="opened = null"><v-icon>mdi-close</v-icon></v-btn>
				</v-card-title>
				<v-card-text>
					<v-progress-linear v-if="versionsLoading" indeterminate :color="pageColor" />
					<p v-else-if="!versions.length">{{ strings.no_versions }}</p>
					<template v-else>
						<mod-version-filters
							v-model="filters"
							class="my-4"
							:versions="versions"
							:color="pageColor"
						/>
						<p v-if="!visibleVersions.length" class="text-center mt-4">
							{{ $root.lang().mods.filters.no_match }}
						</p>
					</template>
					<v-list v-if="!versionsLoading && visibleVersions.length">
						<v-list-item v-for="v in visibleVersions" :key="v.id">
							<v-list-item-content>
								<v-list-item-title>
									{{ v.version }}
									<v-chip x-small class="ml-2" :color="statusColor(v.status)" dark>
										{{ strings.status[v.status] }}
									</v-chip>
									<v-chip v-if="v.blacklisted" x-small class="ml-1">
										{{ strings.blacklisted }}
									</v-chip>
									<v-chip
										v-if="channelOf(v) !== 'release'"
										x-small
										class="ml-1"
										:color="channelColor(channelOf(v))"
										dark
									>
										{{ channelOf(v) }}
									</v-chip>
								</v-list-item-title>
								<v-list-item-subtitle>
									{{ v.minecraft.join(", ") }} · {{ v.loaders.join(", ") }} ·
									{{ v.source.join(", ") }}
								</v-list-item-subtitle>
								<v-list-item-subtitle v-if="v.error" class="red--text text-wrap">
									{{ v.error }}
								</v-list-item-subtitle>
								<v-list-item-subtitle
									v-for="w in v.warnings || []"
									:key="w"
									class="orange--text text-wrap"
								>
									{{ strings.warnings }}: {{ w }}
								</v-list-item-subtitle>
							</v-list-item-content>
							<v-list-item-action class="merged-actions">
								<v-btn
									v-if="v.status === 'extracted'"
									icon
									:title="strings.textures"
									:to="`/mods/${openedMod.slug}/${encodeURIComponent(v.version)}`"
									@click="opened = null"
								>
									<v-icon>mdi-image-multiple</v-icon>
								</v-btn>
								<v-btn
									v-if="v.status === 'extracted'"
									icon
									:title="$root.lang().mods.merge.review"
									@click="openMerge(v)"
								>
									<v-icon>mdi-merge</v-icon>
								</v-btn>
								<v-btn
									icon
									:title="v.blacklisted ? strings.allow : strings.blacklist"
									@click="setBlacklisted(`mod-versions/${v.id}`, !v.blacklisted)"
								>
									<v-icon>{{ v.blacklisted ? "mdi-check-circle-outline" : "mdi-cancel" }}</v-icon>
								</v-btn>
								<v-btn icon :title="strings.delete_version" @click="askRemoveVersion(v)">
									<v-icon color="red lighten-1">mdi-delete</v-icon>
								</v-btn>
							</v-list-item-action>
						</v-list-item>
					</v-list>

					<div class="d-flex justify-end flex-wrap mt-4" style="gap: 8px">
						<v-btn :color="pageColor" class="white--text" @click="openVersionImport">
							<v-icon left>mdi-plus</v-icon>
							{{ strings.import_versions }}
						</v-btn>
						<v-btn outlined @click="setBlacklisted(`mods/${openedMod.id}`, !openedMod.blacklisted)">
							<v-icon left>
								{{ openedMod.blacklisted ? "mdi-check-circle-outline" : "mdi-cancel" }}
							</v-icon>
							{{ openedMod.blacklisted ? strings.allow_mod : strings.blacklist_mod }}
						</v-btn>
						<v-btn outlined color="red" @click="askRemoveMod">
							<v-icon left>mdi-delete</v-icon>
							{{ strings.delete_mod }}
						</v-btn>
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>

		<merge-modal
			v-model="mergeOpen"
			:version="mergeVersion"
			:modName="openedMod ? openedMod.name : ''"
			:color="pageColor"
		/>

		<mod-remove-confirm
			v-model="remove.open"
			:type="remove.type"
			:data="remove.data"
			:versionCount="versions.length"
			@close="onRemoved"
		/>
	</v-container>
</template>

<script>
import axios from "axios";
import SmartGrid from "@layouts/smart-grid.vue";
import SearchBox from "@components/search-box.vue";
import { generatePageStyles } from "@helpers/colors";
import ModIcon from "@components/mod-icon.vue";
import PlatformIcon from "@components/platform-icon.vue";
import ModVersionFilters from "@components/mod-version-filters.vue";
import {
	channelColor,
	channelOf,
	defaultModVersionFilters,
	filterModVersions,
	sortModVersions,
} from "@helpers/modVersions";
import ImportModal from "./import-modal.vue";
import MergeModal from "./merge-modal.vue";
import ModRemoveConfirm from "./mod-remove-confirm.vue";

// extraction runs in the background so the status is refreshed while a version is pending
const POLL_INTERVAL = 5000;

export default {
	name: "mods-admin-page",
	components: {
		SmartGrid,
		SearchBox,
		ImportModal,
		MergeModal,
		ModRemoveConfirm,
		ModIcon,
		PlatformIcon,
		ModVersionFilters,
	},
	data() {
		return {
			pageColor: "teal darken-1",
			pageStyles: "",
			mods: [],
			loading: true,
			search: "",
			importOpen: false,
			// mod to import new versions of, null to search for a new mod
			importMod: null,
			mergeOpen: false,
			mergeVersion: null,
			remove: { open: false, type: "mod", data: {} },
			opened: null,
			versions: [],
			versionsLoading: false,
			pollTimer: null,
			filters: defaultModVersionFilters(),
		};
	},
	computed: {
		strings() {
			return this.$root.lang().mods.admin;
		},
		filtered() {
			const query = this.search?.trim().toLowerCase();
			return this.mods.filter(
				(m) =>
					!query ||
					m.name.toLowerCase().includes(query) ||
					m.slug.toLowerCase().includes(query) ||
					m.aliases.some((a) => a.toLowerCase().includes(query)),
			);
		},
		visibleVersions() {
			return sortModVersions(filterModVersions(this.versions, this.filters));
		},
		openedMod() {
			return this.mods.find((m) => m.id === this.opened);
		},
	},
	methods: {
		channelOf,
		channelColor,
		statusColor(status) {
			return { pending: "grey", extracting: "blue", extracted: "green", failed: "red" }[status];
		},
		openImport() {
			this.importMod = null;
			this.importOpen = true;
		},
		openVersionImport() {
			this.importMod = this.openedMod;
			this.importOpen = true;
		},
		openMerge(version) {
			this.mergeVersion = version;
			this.mergeOpen = true;
		},
		onImported() {
			this.reload();
			// new versions are extracted in the background, show them as they appear
			if (this.opened) {
				this.versionsLoading = true;
				this.loadVersions();
			}
		},
		askRemoveMod() {
			this.remove = { open: true, type: "mod", data: this.openedMod };
		},
		askRemoveVersion(version) {
			this.remove = { open: true, type: "version", data: version };
		},
		onRemoved(success) {
			this.remove.open = false;
			if (!success) return;
			if (this.remove.type === "mod") this.opened = null;
			this.reload();
			if (this.opened) this.loadVersions();
		},
		reload() {
			this.loading = true;
			axios
				.get(`${this.$root.apiURL}/mods/search`)
				.then((res) => {
					this.mods = res.data.sort((a, b) => a.name.localeCompare(b.name));
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackbar(err, "error");
				})
				.finally(() => (this.loading = false));
		},
		toggle(id) {
			this.opened = id;
		},
		async loadVersions() {
			if (!this.opened) return;
			try {
				const res = await axios.get(`${this.$root.apiURL}/mods/${this.opened}/versions`);
				this.versions = res.data.sort((a, b) => b.imported_at - a.imported_at);
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.versionsLoading = false;
			}
			this.schedulePoll();
		},
		schedulePoll() {
			clearTimeout(this.pollTimer);
			if (!this.opened) return;
			if (this.versions.some((v) => v.status === "pending" || v.status === "extracting"))
				this.pollTimer = setTimeout(this.loadVersions, POLL_INTERVAL);
		},
		// blacklisted mods and versions don't accept contributions anymore
		setBlacklisted(route, blacklisted) {
			this.$root
				.wrapSnackbar(
					axios.put(`${this.$root.apiURL}/${route}`, { blacklisted }, this.$root.apiOptions),
					this.strings.blacklist_success,
				)
				.then(() => {
					this.reload();
					return this.loadVersions();
				})
				.catch(() => {});
		},
	},
	watch: {
		opened(id) {
			this.versions = [];
			this.filters = defaultModVersionFilters();
			clearTimeout(this.pollTimer);
			if (!id) return;
			this.versionsLoading = true;
			this.loadVersions();
		},
	},
	created() {
		this.reload();
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);
	},
	beforeDestroy() {
		clearTimeout(this.pollTimer);
	},
};
</script>
