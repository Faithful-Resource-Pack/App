<template>
	<v-container id="modPickerPage">
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
					@change="(value) => setQuery({ pack: value })"
				/>
			</v-col>
			<v-col cols="12" sm="6">
				<v-select
					:value="minecraft"
					:items="minecraftVersions"
					:label="$root.lang().mods.filters.minecraft"
					:color="pageColor"
					:item-color="pageColor"
					:loading="versionsLoading"
					hide-details
					@change="(value) => setQuery({ minecraft: value })"
				/>
			</v-col>
		</v-row>

		<div v-if="!pack || !minecraft" class="text-h6 text-center my-8">
			<v-icon left>mdi-puzzle</v-icon>
			{{ strings.select }}
		</div>
		<template v-else>
			<search-box
				v-model="search"
				class="mt-4"
				:autofocus="false"
				:placeholder="strings.search"
				:color="pageColor"
			/>

			<v-card class="main-container mt-2">
				<loading-page v-if="modsLoading">
					{{ $root.lang().gallery.loading_message }}
				</loading-page>
				<div v-else-if="!picks.length" class="text-h6 text-center pa-4">
					<v-icon left>mdi-alert-circle-outline</v-icon>
					{{ strings.no_mods }}
				</div>
				<v-list v-else two-line>
					<v-list-item v-if="!search">
						<v-list-item-action>
							<v-checkbox
								:input-value="allSelected"
								:indeterminate="someSelected && !allSelected"
								:color="pageColor"
								@change="toggleAll"
							/>
						</v-list-item-action>
						<v-list-item-content>
							<v-list-item-title>{{ strings.select_contributed }}</v-list-item-title>
						</v-list-item-content>
					</v-list-item>
					<v-divider v-if="!search" />
					<v-list-item v-for="item in filtered" :key="item.mod.id" @click="toggle(item.mod.id)">
						<v-list-item-action>
							<v-checkbox :input-value="item.mod.id in selected" :color="pageColor" readonly />
						</v-list-item-action>
						<mod-icon :src="item.mod.icon" :size="36" class="mr-4" />
						<v-list-item-content>
							<v-list-item-title>{{ item.mod.name }}</v-list-item-title>
							<v-list-item-subtitle>{{ progress(chosen(item)) }}</v-list-item-subtitle>
						</v-list-item-content>
						<v-select
							:value="chosen(item).version.id"
							:items="versionItems(item)"
							item-text="label"
							item-value="id"
							:label="strings.version"
							:color="pageColor"
							:item-color="pageColor"
							class="version-select ml-4"
							dense
							hide-details
							@click.stop
							@change="(id) => selectVersion(item, id)"
						/>
						<v-list-item-action>
							<v-progress-circular :value="percent(chosen(item))" :color="pageColor" size="28" />
						</v-list-item-action>
					</v-list-item>
				</v-list>
			</v-card>

			<div class="d-flex align-center mt-4">
				<span class="mr-4">{{ strings.selected.replace("%COUNT%", selectedCount) }}</span>
				<v-spacer />
				<v-btn :color="pageColor" :disabled="!selectedCount" :loading="building" @click="build">
					<v-icon left>mdi-download</v-icon>
					{{ strings.build }}
				</v-btn>
			</div>
		</template>
	</v-container>
</template>

<script>
import axios from "axios";
import SearchBox from "@components/search-box.vue";
import ModIcon from "@components/mod-icon.vue";
import { modRepository } from "@helpers/modContributions";
import LoadingPage from "@layouts/loading-page.vue";
import { generatePageStyles } from "@helpers/colors";

// vanilla packs have no modded textures
const VANILLA_PACKS = ["default", "progart"];

export default {
	name: "mod-picker-page",
	components: { SearchBox, ModIcon, LoadingPage },
	data() {
		return {
			pageColor: "teal darken-1",
			pageStyles: "",
			packs: [],
			minecraftVersions: [],
			versionsLoading: true,
			picks: [],
			modsLoading: false,
			// mod ids
			// chosen mod version id by mod id
			selected: {},
			// version picked in the list by mod id, even before the mod is ticked
			chosenVersions: {},
			search: "",
			building: false,
		};
	},
	computed: {
		strings() {
			return this.$root.lang().mods.picker;
		},
		pack() {
			return this.$route.query.pack || "";
		},
		minecraft() {
			return this.$route.query.minecraft || "";
		},
		packList() {
			return this.packs
				.filter((p) => !VANILLA_PACKS.includes(p.id) && modRepository(p))
				.map((p) => ({ label: p.name, value: p.id }));
		},
		filtered() {
			const query = this.search?.trim().toLowerCase();
			return this.picks.filter(
				(p) =>
					!query ||
					p.mod.name.toLowerCase().includes(query) ||
					p.mod.aliases.some((a) => a.toLowerCase().includes(query)),
			);
		},
		// mods whose chosen version has at least one contribution for the pack
		contributed() {
			return this.picks.filter((p) => this.chosen(p).contributed > 0);
		},
		selectedCount() {
			return Object.keys(this.selected).length;
		},
		allSelected() {
			return !!this.contributed.length && this.contributed.every((p) => p.mod.id in this.selected);
		},
		someSelected() {
			return this.selectedCount > 0;
		},
	},
	watch: {
		"$route.query": "loadMods",
	},
	methods: {
		setQuery(changes) {
			this.$router.replace({ query: { ...this.$route.query, ...changes } });
		},
		// the version picked for a mod, the newest release by default
		chosen(item) {
			const id = this.chosenVersions[item.mod.id];
			return (
				item.versions.find((v) => v.version.id === id) ??
				item.versions.find((v) => (v.version.channel ?? "release") === "release") ??
				item.versions[0]
			);
		},
		versionItems(item) {
			return item.versions.map((v) => {
				const channel = v.version.channel ?? "release";
				return {
					id: v.version.id,
					label: channel === "release" ? v.version.version : `${v.version.version} (${channel})`,
				};
			});
		},
		// blacklisted textures can't be contributed to, they count as done
		done(version) {
			return version.contributed + version.blacklisted;
		},
		percent(version) {
			return version.total ? (this.done(version) / version.total) * 100 : 0;
		},
		progress(version) {
			return this.strings.progress
				.replace("%DONE%", this.done(version))
				.replace("%TOTAL%", version.total);
		},
		selectVersion(item, versionId) {
			this.$set(this.chosenVersions, item.mod.id, versionId);
			if (item.mod.id in this.selected) this.$set(this.selected, item.mod.id, versionId);
		},
		toggle(id) {
			if (id in this.selected) return this.$delete(this.selected, id);
			const item = this.picks.find((p) => p.mod.id === id);
			this.$set(this.selected, id, this.chosen(item).version.id);
		},
		toggleAll(value) {
			this.selected = value
				? Object.fromEntries(this.contributed.map((p) => [p.mod.id, this.chosen(p).version.id]))
				: {};
		},
		loadMods() {
			if (!this.pack || !this.minecraft) return;
			this.modsLoading = true;
			const { pack, minecraft } = this;
			axios
				.get(`${this.$root.apiURL}/mods/pickable`, { params: { pack, minecraft } })
				.then((res) => {
					// ignore answers of a previous selection
					if (pack !== this.pack || minecraft !== this.minecraft) return;
					this.picks = res.data;
					// the versions depend on the minecraft version, so previous choices are dropped
					this.selected = {};
					this.chosenVersions = {};
				})
				.catch((err) => this.$root.showSnackbar(err, "error"))
				.finally(() => {
					this.modsLoading = false;
				});
		},
		build() {
			this.building = true;
			axios
				.post(
					`${this.$root.apiURL}/builds/mods`,
					{
						pack: this.pack,
						minecraft: this.minecraft,
						mod_version_ids: Object.values(this.selected),
					},
					{ responseType: "blob" },
				)
				.then((res) => {
					const url = URL.createObjectURL(res.data);
					const link = document.createElement("a");
					link.href = url;
					link.download = `${this.pack}-mods-${this.minecraft}.zip`;
					link.click();
					URL.revokeObjectURL(url);
				})
				.catch(async (err) => {
					// the error body is a blob since the response is expected to be a zip
					const body = err.response?.data instanceof Blob ? await err.response.data.text() : "";
					let message = err;
					try {
						message = JSON.parse(body).message || err;
					} catch {
						// not json, show the original error
					}
					this.$root.showSnackbar(message, "error");
				})
				.finally(() => {
					this.building = false;
				});
		},
	},
	created() {
		axios
			.get(`${this.$root.apiURL}/packs/raw`)
			.then((res) => {
				this.packs = Object.values(res.data);
			})
			.catch((err) => this.$root.showSnackbar(err, "error"));
		axios
			.get(`${this.$root.apiURL}/mods/minecraft`)
			.then((res) => {
				this.minecraftVersions = res.data;
			})
			.catch((err) => this.$root.showSnackbar(err, "error"))
			.finally(() => {
				this.versionsLoading = false;
			});
		this.loadMods();
	},
	mounted() {
		this.pageStyles = generatePageStyles(this.pageColor);
	},
};
</script>

<style scoped>
.version-select {
	max-width: 220px;
}
</style>
