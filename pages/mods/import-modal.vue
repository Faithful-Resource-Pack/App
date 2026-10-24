<template>
	<modal-form
		v-model="modalOpen"
		:title="strings.title"
		:disabled="!canImport"
		max-width="900"
		@close="$emit('close')"
		@submit="send"
	>
		<search-box
			v-if="!mod"
			v-model="query"
			:autofocus="false"
			:label="strings.search"
			:color="color"
			:loading="searching"
			@search="search"
			@clear="clear"
		/>

		<!-- only the results scroll so the search and buttons stay visible -->
		<div v-if="!group" class="scroll-area mt-2">
			<p v-if="searched && !groups.length" class="mt-4 text-center">{{ strings.no_results }}</p>
			<v-list v-else-if="groups.length">
				<v-list-item v-for="g in groups" :key="g.keys[0]" @click="pick(g)">
					<v-list-item-avatar tile class="rounded">
						<mod-icon :src="g.icon" :size="40" />
					</v-list-item-avatar>
					<v-list-item-content>
						<v-list-item-title>{{ g.name }}</v-list-item-title>
						<v-list-item-subtitle>{{ g.summary }}</v-list-item-subtitle>
					</v-list-item-content>
					<v-list-item-action class="flex-row align-center">
						<platform-icon
							v-for="p in g.projects"
							:key="p.platform"
							:platform="p.platform"
							:size="24"
							class="ml-2"
						/>
					</v-list-item-action>
				</v-list-item>
			</v-list>
		</div>

		<template v-else>
			<div class="d-flex align-center my-4">
				<v-btn v-if="!mod" icon class="mr-2" @click="group = null">
					<v-icon>mdi-arrow-left</v-icon>
				</v-btn>
				<mod-icon :src="group.icon" :size="32" class="mr-2" />
				<span class="text-h6">{{ group.name }}</span>
				<platform-icon
					v-for="p in group.projects"
					:key="p.platform"
					:platform="p.platform"
					:size="20"
					class="ml-2"
				/>
			</div>

			<p v-if="mod" class="text--secondary">{{ strings.new_only }}</p>
			<v-autocomplete
				v-if="!mod"
				v-model="linkedMod"
				:items="mods"
				item-text="name"
				item-value="id"
				:label="strings.link_mod"
				:color="color"
				:item-color="color"
				clearable
				hide-details
				class="mb-8"
			/>

			<mod-version-filters
				v-model="filters"
				:versions="rows"
				:color="color"
				showUnparsed
				class="mb-2"
			/>

			<h3 class="text-h6 my-2">{{ strings.select_files }}</h3>
			<v-progress-linear v-if="filesLoading" indeterminate :color="color" />
			<p v-else-if="!visibleRows.length" class="text-center">
				{{ $root.lang().mods.filters.no_match }}
			</p>
			<v-simple-table v-else dense fixed-header height="35vh">
				<thead>
					<tr>
						<th />
						<th>{{ strings.version }}</th>
						<th>{{ strings.platforms }}</th>
						<th>{{ strings.channel }}</th>
						<th>{{ strings.minecraft }}</th>
						<th>{{ strings.loaders }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="r in visibleRows" :key="r.id">
						<td>
							<v-checkbox v-model="selected" :value="r.id" :color="color" hide-details />
						</td>
						<td>
							<v-text-field
								v-if="!r.version"
								v-model="manual[r.id]"
								dense
								hide-details
								:placeholder="r.raw_version"
								:color="color"
								:error="selected.includes(r.id) && !isSemver(manual[r.id])"
							/>
							<template v-else>{{ r.version }}</template>
						</td>
						<td>
							<platform-icon
								v-for="platform in r.platforms"
								:key="platform"
								:platform="platform"
								:size="18"
								class="mr-1"
							/>
						</td>
						<td>
							<v-chip x-small :color="channelColor(r.channel)" :dark="r.channel !== 'release'">
								{{ r.channel }}
							</v-chip>
						</td>
						<td>{{ r.minecraft.join(", ") }}</td>
						<td>{{ r.loaders.join(", ") }}</td>
					</tr>
				</tbody>
			</v-simple-table>
		</template>
	</modal-form>
</template>

<script>
import axios from "axios";
import ModalForm from "@layouts/modal-form.vue";
import SearchBox from "@components/search-box.vue";
import ModIcon from "@components/mod-icon.vue";
import PlatformIcon from "@components/platform-icon.vue";
import ModVersionFilters from "@components/mod-version-filters.vue";
import { fileToImport, groupResults, mergeFiles } from "@helpers/modImport";
import {
	channelColor,
	defaultModVersionFilters,
	filterModVersions,
	sortModVersions,
} from "@helpers/modVersions";

/** Exact name or slug matches first, then alphabetical */
function sortResults(results, query) {
	const q = query.trim().toLowerCase();
	const exact = (r) =>
		r.exact || r.name.toLowerCase() === q || r.slug.toLowerCase() === q || r.project_id === q;
	return [...results].sort(
		(a, b) => Number(exact(b)) - Number(exact(a)) || a.name.localeCompare(b.name),
	);
}

const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

export default {
	name: "import-mod-modal",
	components: {
		ModalForm,
		SearchBox,
		ModIcon,
		PlatformIcon,
		ModVersionFilters,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		// existing mods, to link a platform project to one of them
		mods: {
			type: Array,
			required: true,
		},
		// mod to import new versions of, skips the search
		mod: {
			type: Object,
			required: false,
			default: null,
		},
		// versions the mod already has, they are not offered again
		existingVersions: {
			type: Array,
			required: false,
			default: () => [],
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
	},
	emits: ["input", "close"],
	data() {
		return {
			modalOpen: false,
			query: "",
			searching: false,
			searched: false,
			groups: [],
			// selected search result: the same mod on one or more platforms
			group: null,
			filesLoading: false,
			rows: [],
			selected: [],
			manual: {},
			linkedMod: null,
			filters: defaultModVersionFilters(),
		};
	},
	computed: {
		visibleRows() {
			const rows = this.mod
				? this.rows.filter((r) => !this.existingVersions.some((v) => v.version === r.version))
				: this.rows;
			return sortModVersions(filterModVersions(rows, this.filters));
		},
		strings() {
			return this.$root.lang().mods.import;
		},
		canImport() {
			if (!this.group || !this.selected.length) return false;
			return this.selected.every((id) => {
				const row = this.rows.find((r) => r.id === id);
				return row.version || this.isSemver(this.manual[id]);
			});
		},
	},
	methods: {
		channelColor,
		isSemver(value) {
			return SEMVER.test(value || "");
		},
		clear() {
			this.groups = [];
			this.searched = false;
		},
		async search() {
			if (!this.query?.trim()) return;
			this.searching = true;
			try {
				const res = await axios.get(`${this.$root.apiURL}/mod-import/search`, {
					params: { q: this.query },
					...this.$root.apiOptions,
				});
				this.groups = groupResults(sortResults(res.data.results, this.query));
				// a failing platform shouldn't look like a mod that doesn't exist
				for (const platform of res.data.errors)
					this.$root.showSnackbar(
						this.strings.search_failed.replace("%PLATFORM%", platform),
						"warning",
					);
				this.searched = true;
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.searching = false;
			}
		},
		async pick(group) {
			this.group = group;
			this.rows = [];
			this.selected = [];
			this.manual = {};
			// the mod is probably already known from another platform or under the same slug
			this.linkedMod = this.existingMod(group)?.id ?? null;
			this.filters = defaultModVersionFilters();
			this.filesLoading = true;
			try {
				const lists = await Promise.all(
					group.projects.map((p) =>
						axios
							.get(
								`${this.$root.apiURL}/mod-import/${p.platform}/${p.project_id}/files`,
								this.$root.apiOptions,
							)
							.then((res) => res.data),
					),
				);
				this.rows = mergeFiles(lists.flat());
			} catch (err) {
				console.error(err);
				this.$root.showSnackbar(err, "error");
			} finally {
				this.filesLoading = false;
			}
		},
		/** The mod's platform projects as a search result group */
		groupOfMod(mod) {
			const projects = [
				mod.providers?.curseforge && {
					platform: "curseforge",
					project_id: mod.providers.curseforge,
				},
				mod.providers?.modrinth && { platform: "modrinth", project_id: mod.providers.modrinth },
			]
				.filter(Boolean)
				.map((p) => ({ ...p, name: mod.name, slug: mod.slug }));
			return { name: mod.name, icon: mod.icon, summary: "", keys: [mod.slug], projects };
		},
		existingMod(group) {
			const slugs = group.projects.map((p) => p.slug);
			return this.mods.find(
				(m) =>
					group.projects.some((p) => m.providers?.[p.platform] === p.project_id) ||
					slugs.includes(m.slug),
			);
		},
		/** Import the selected rows platform by platform, every platform of the group is linked to the mod */
		async send() {
			// one file per row is enough, they hold the same assets on every platform
			const byPlatform = {};
			for (const id of this.selected) {
				const file = fileToImport(this.rows.find((r) => r.id === id));
				(byPlatform[file.platform] ||= []).push({ file, manual: this.manual[id] });
			}

			// platforms without a selected file are only linked
			const calls = this.group.projects.map((project) => {
				const picked = byPlatform[project.platform] ?? [];
				return {
					platform: project.platform,
					project_id: project.project_id,
					file_ids: picked.map((p) => p.file.file_id),
					versions: Object.fromEntries(
						picked.filter((p) => p.manual).map((p) => [p.file.file_id, p.manual]),
					),
				};
			});
			// import first so the mod gets created by a call that has files
			calls.sort((a, b) => b.file_ids.length - a.file_ids.length);

			const run = async () => {
				let modId = this.linkedMod;
				for (const call of calls) {
					const res = await axios.post(
						`${this.$root.apiURL}/mod-import`,
						{ ...call, ...(modId && { mod_id: modId }) },
						this.$root.apiOptions,
					);
					modId = res.data.mod.id;
				}
			};

			this.$root
				.wrapSnackbar(run(), this.strings.success)
				.then(() => this.$emit("close"))
				.catch(() => {});
		},
	},
	watch: {
		value(newValue) {
			this.modalOpen = newValue;
			if (newValue && this.mod) this.pick(this.groupOfMod(this.mod));
		},
		modalOpen(newValue) {
			this.$emit("input", newValue);
			if (!newValue) this.group = null;
		},
	},
};
</script>

<style scoped>
.scroll-area {
	max-height: 55vh;
	overflow-y: auto;
}
</style>
