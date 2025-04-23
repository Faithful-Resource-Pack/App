<template>
	<v-container>
		<contribution-modal
			v-model="modalOpen"
			:data="modalData"
			:add="modalAdd"
			:packs="packs"
			:contributors="contributors"
			@close="closeModal"
		/>
		<contribution-remove-confirm
			v-model="remove.confirm"
			:data="remove.data"
			:contributors="contributors"
			@close="closeDeleteModal"
		/>

		<v-row no-gutters class="py-0 mb-0" align="center">
			<v-col cols="12" sm="6" class="mt-4 py-sm-0">
				<div class="text-h4 py-4">
					{{ $root.lang().database.contributions.title }}
				</div>
			</v-col>
			<v-col cols="12" sm="6" class="mt-4 py-sm-0">
				<v-btn block color="primary" @click="addContribution">
					{{ $root.lang().database.contributions.add_manually }}<v-icon right dark>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>

		<!-- Pack selection -->
		<h2 class="my-2 text-h5">{{ $root.lang().database.contributions.pack_filter }}</h2>
		<div class="d-flex flex-wrap ma-n1">
			<v-card
				v-for="(packObj, key) in selectedPacks"
				:key="key"
				class="ma-1 px-4 py-2 text-uppercase v-btn v-btn--has-bg font-weight-medium"
			>
				<v-checkbox
					v-model="packObj.selected"
					:label="packObj.label"
					:id="key"
					hide-details
					class="ma-0 pt-0"
					@change="(val) => onPackChange(key, val)"
				/>
			</v-card>
		</div>

		<!-- Contribution search -->
		<h2 class="my-2 text-h5">{{ $root.lang().database.search }}</h2>
		<v-row align="stretch" class="my-2">
			<v-col cols="12" sm="6" class="pt-0 py-sm-0">
				<user-select
					persistent-placeholder
					:label="$root.lang().database.contributions.user_filter"
					outlined
					v-model="selectedContributors"
					:users="contributors"
					:placeholder="$root.lang().database.contributions.select_user"
					hide-details
					class="my-0 pt-0"
					small-chips
					clearable
					@newUser="
						(l) => {
							contributors = l;
						}
					"
				/>
			</v-col>
			<v-col cols="12" sm="6" class="pb-0 py-sm-0">
				<v-text-field
					persistent-placeholder
					:label="$root.lang().database.contributions.texture_filter"
					outlined
					style="height: 100%"
					type="search"
					v-model="searchValue"
					class="pt-0 my-0"
					height="100%"
					:placeholder="$root.lang().database.textures.search_texture"
					@keyup.enter="startSearch()"
					hide-details
				/>
			</v-col>
		</v-row>

		<!-- Search button -->
		<v-btn block color="primary" @click="startSearch()" :disabled="searchDisabled" class="my-6">
			{{ $root.lang().database.contributions.search_contributions }}
			<v-icon right dark>mdi-magnify</v-icon>
		</v-btn>

		<div class="mb-2 text-h5">{{ $root.lang().database.contributions.contribution_result }}</div>

		<smart-grid v-if="searchResults.length" :items="searchResults" track="id">
			<template #default="{ item }">
				<v-list-item-avatar tile class="texture-preview">
					<a :href="`/gallery?show=${item.texture}`" target="_blank">
						<v-img class="texture-img" :src="item.url" :lazy-src="logos[item.pack]" />
					</a>
				</v-list-item-avatar>

				<v-list-item-content>
					<v-list-item-title>
						{{ `${item.name || "Unknown texture"} • ${moment(new Date(item.date)).format("ll")}` }}
					</v-list-item-title>
					<v-list-item-subtitle>
						{{
							(item.authors || [])
								.map((id) => contributors.find((c) => c.id == id).username || id)
								.join(", ")
						}}
					</v-list-item-subtitle>

					<div>
						<v-chip label x-small class="mr-1"> {{ packToCode[item.pack] }} </v-chip>
						<a :href="`/gallery?show=${item.texture}`" target="_blank">
							<v-chip style="cursor: pointer" label x-small class="mr-1">
								#{{ item.texture }} <span class="mdi mdi-open-in-new ml-1" />
							</v-chip>
						</a>
					</div>
				</v-list-item-content>

				<v-list-item-action class="merged">
					<v-btn icon @click="editContribution(item)">
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn icon @click="openDeleteModal(item)">
						<v-icon color="red lighten-1">mdi-delete</v-icon>
					</v-btn>
				</v-list-item-action>
			</template>
		</smart-grid>
		<div v-else>
			<br />
			<i>{{ $root.lang().global.no_results }}</i>
		</div>
	</v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";

import ContributionModal from "./contribution-modal.vue";
import ContributionRemoveConfirm from "./contribution-remove-confirm.vue";
import UserSelect from "@components/user-select.vue";
import SmartGrid from "@components/smart-grid.vue";

const ALL_PACK_KEY = "all";

export default {
	name: "contribution-page",
	components: {
		SmartGrid,
		ContributionModal,
		UserSelect,
		ContributionRemoveConfirm,
	},
	data() {
		return {
			// more convenient to have as object for retrieval
			selectedPacks: {
				[ALL_PACK_KEY]: {
					key: ALL_PACK_KEY,
					// reuse gallery translation because it's the same thing
					label: this.$root.lang().gallery.all,
					selected: true,
				},
			},
			contributors: [],
			selectedContributors: [],
			packs: [],
			packToCode: {},
			logos: {},
			searching: false,
			searchResults: [],
			searchValue: "",
			modalOpen: false,
			modalAdd: false,
			modalData: null,
			remove: {
				confirm: false,
				data: {},
			},
		};
	},
	methods: {
		// expose for inline use
		moment,
		addContribution() {
			this.modalOpen = true;
			this.modalAdd = true;
			this.modalData = null;
		},
		editContribution(contrib) {
			this.modalOpen = true;
			this.modalAdd = false;
			this.modalData = contrib;
		},
		closeModal(refresh = false) {
			this.modalOpen = false;
			this.modalData = null;
			if (refresh) this.startSearch();
		},
		openDeleteModal(data) {
			this.remove.data = data;
			this.remove.confirm = true;
		},
		closeDeleteModal(refresh = false) {
			this.remove.confirm = false;
			if (refresh) this.startSearch();
		},
		onPackChange(key, isSelected) {
			if (key === ALL_PACK_KEY) {
				if (isSelected) {
					// just checked all, uncheck others
					for (const key in Object.keys(this.selectedPacks))
						this.selectedPacks[key].selected = false;
					this.selectedPacks[ALL_PACK_KEY].selected = true;
				} else this.onPackDeselect(key);
				return;
			}
			// other pack
			if (isSelected) {
				this.selectedPacks[ALL_PACK_KEY].selected = false;
			} else this.onPackDeselect(key);
		},
		onPackDeselect(key) {
			// do nothing, at least one is selected
			if (this.selectedPackKeys.length > 0) return;

			// needs to be changed on next tick, cannot change same data on same cycle
			this.$nextTick(() => {
				this.selectedPacks[key].selected = true;
			});
		},
		startSearch() {
			if (this.searchDisabled) return;
			this.searching = true;

			const url = new URL(`${this.$root.apiURL}/contributions/search`);
			url.searchParams.set("packs", this.selectedPackKeys.join("-"));
			url.searchParams.set("users", this.selectedContributors.join("-"));
			url.searchParams.set("search", this.searchValue);

			Promise.all([axios.get(url.toString()), axios.get(`${this.$root.apiURL}/textures/raw`)])
				.then(([contributions, textures]) => {
					this.searchResults = contributions.data
						.sort((a, b) => b.date - a.date)
						.map((c) => ({
							...c,
							url: `${this.$root.apiURL}/textures/${c.texture}/url/${c.pack}/latest`,
							name: textures.data[c.texture]?.name || "",
						}));
				})
				.finally(() => {
					this.searching = false;
				})
				.catch((err) => this.$root.showSnackBar(err, "error"));
		},
		async getPacks() {
			this.packs = (await axios.get(`${this.$root.apiURL}/packs/search?type=submission`)).data;
			for (const pack of Object.values(this.packs)) {
				this.selectedPacks[pack.id] = {
					key: pack.id,
					label: pack.name,
					selected: false,
				};
				this.logos[pack.id] = pack.logo;
				this.packToCode[pack.id] = pack.name
					.split(" ")
					// Classic Faithful 32x Jappa -> CF32J
					.map((el) => (isNaN(Number(el[0])) ? el[0].toUpperCase() : el.match(/\d+/g)?.[0]))
					.join("");
			}
		},
		async getAuthors() {
			const authors = (await axios.get(`${this.$root.apiURL}/contributions/authors`)).data;
			// assign the result sorted by username
			this.contributors = authors.sort((a, b) => {
				if (!a.username && !b.username) return 0;
				if (a.username && !b.username) return 1;
				if (!a.username && b.username) return -1;

				return a.username.toLowerCase() > b.username.toLowerCase()
					? 1
					: b.username.toLowerCase() > a.username.toLowerCase()
						? -1
						: 0;
			});
		},
	},
	computed: {
		searchInvalid() {
			if (this.searchValue.length === 0) return true;

			// if search is numeric it can be fewer than three characters
			return this.searchValue.length < 3 && isNaN(Number(this.searchValue));
		},
		searchDisabled() {
			const noFilters = this.selectedContributors.length === 0 && this.searchInvalid;
			return this.searching || noFilters;
		},
		selectedPackKeys() {
			return Object.keys(this.selectedPacks).filter((k) => this.selectedPacks[k].selected);
		},
	},
	created() {
		this.getPacks();
		this.getAuthors();
	},
	watch: {
		contributors: {
			handler(newValue) {
				// FIX BUG WHERE USERS WITH NO CONTRIBUTIONS GET INCLUDED IN SEARCH
				const contributorIDs = new Set(newValue.map((c) => c.id));
				this.selectedContributors = this.selectedContributors.filter((c) => contributorIDs.has(c));
			},
			deep: true,
		},
	},
};
</script>
