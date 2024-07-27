<template>
	<v-container>
		<contribution-modal
			ref="mod"
			:contributors="contributors"
			:onSubmit="onModalSubmit"
			:multiple="multiple"
		/>
		<contribution-remove-confirm
			v-model="remove.confirm"
			:data="remove.data"
			:contributors="contributors"
			@close="close"
		/>

		<v-row no-gutters class="py-0 mb-0" align="center">
			<v-col cols="12" sm="6" class="mt-4 py-sm-0">
				<div class="text-h4 py-4">
					{{ $root.lang().database.titles.contributions }}
				</div>
			</v-col>
			<v-col cols="12" sm="6" class="mt-4 py-sm-0">
				<v-btn block color="primary" @click="openAdd()">
					{{ $root.lang("database.subtitles.add_manually") }}<v-icon right dark>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>

		<!-- Pack selection -->
		<h2 class="my-2 text-h5">{{ $root.lang().database.subtitles.resource_packs }}</h2>
		<div class="d-flex flex-wrap ma-n1">
			<v-card
				v-for="packs_obj in form.packs"
				:key="packs_obj.key"
				class="ma-1 px-4 py-2 text-uppercase v-btn v-btn--has-bg font-weight-medium"
			>
				<v-checkbox
					v-model="packs_obj.selected"
					:label="packs_obj.value"
					:id="packs_obj.key"
					hide-details
					class="ma-0 pt-0"
					@change="(val) => onPackChange(val, packs_obj.key)"
				/>
			</v-card>
		</div>

		<!-- Contribution search -->
		<h2 class="my-2 text-h5">{{ $root.lang().database.subtitles.search }}</h2>
		<v-row align="stretch" class="my-0">
			<v-col cols="12" sm="6" class="pt-0 py-sm-0">
				<user-select
					persistent-placeholder
					:label="$root.lang('database.titles.users')"
					outlined
					v-model="selectedContributors"
					:users="contributors"
					:placeholder="$root.lang().database.labels.select_user"
					hide-details
					class="my-0 pt-0"
					small-chips
					clearable
				/>
			</v-col>
			<v-col cols="12" sm="6" class="pb-0 py-sm-0">
				<v-text-field
					persistent-placeholder
					:label="$root.lang('database.titles.textures')"
					outlined
					style="height: 100%"
					type="search"
					v-model="textureSearch"
					class="pt-0 my-0"
					height="100%"
					:placeholder="$root.lang().database.labels.search_texture"
					@keyup.enter="startSearch()"
					hide-details
				/>
			</v-col>
		</v-row>

		<!-- Search button -->
		<v-btn block color="primary" @click="startSearch()" :disabled="searchDisabled" class="mt-5">
			{{ $root.lang().database.labels.search_contributions }}
			<v-icon right dark>mdi-magnify</v-icon>
		</v-btn>

		<div class="my-2 text-h5">{{ $root.lang().database.subtitles.contribution_result }}</div>

		<v-list rounded v-if="search.search_results.length" two-line class="main-container mt-4">
			<v-row>
				<v-col
					:cols="12 / listColumns"
					xs="1"
					v-for="(contrib_arr, index) in splitResults"
					:key="index"
				>
					<v-list-item
						v-for="(contrib, i) in contrib_arr"
						:key="contrib.id"
						v-if="i < displayedResults"
					>
						<v-list-item-avatar tile class="texture-preview">
							<a :href="`/gallery?show=${contrib.texture}`">
								<v-img class="texture-img" :src="contrib.url" :lazy-src="logos[contrib.pack]" />
							</a>
						</v-list-item-avatar>

						<v-list-item-content>
							<v-list-item-title>
								{{
									`${contrib.name || "Unknown texture"} • ${moment(new Date(contrib.date)).format("ll")}`
								}}
							</v-list-item-title>
							<v-list-item-subtitle>
								{{
									(contrib.authors || [])
										.map((id) => contributors.find((c) => c.id == id).username || id)
										.join(", ")
								}}
							</v-list-item-subtitle>

							<div>
								<v-chip label x-small class="mr-1"> {{ packToCode[contrib.pack] }} </v-chip>
								<a :href="`/gallery?show=${contrib.texture}`" target="_blank">
									<v-chip style="cursor: pointer" label x-small class="mr-1">
										#{{ contrib.texture }} <span class="mdi mdi-open-in-new ml-1" />
									</v-chip>
								</a>
							</div>
						</v-list-item-content>

						<v-list-item-action class="merged">
							<v-btn icon @click="editContribution(contrib)">
								<v-icon color="lighten-1">mdi-pencil</v-icon>
							</v-btn>
							<v-btn icon @click="deleteContribution(contrib)">
								<v-icon color="red lighten-1">mdi-delete</v-icon>
							</v-btn>
						</v-list-item-action>
					</v-list-item>
				</v-col>
			</v-row>

			<v-btn
				:style="{ margin: 'auto', 'min-width': '250px !important' }"
				:disabled="displayedResults >= search.search_results.length"
				block
				color="primary"
				@click="showMore()"
				:v-if="displayedResults < search.search_results.length"
				elevation="2"
			>
				{{ $root.lang().global.btn.load_more }}
			</v-btn>
		</v-list>
		<div v-else>
			<br />
			<p>
				<i>{{ $root.lang().global.no_results }}</i>
			</p>
		</div>
	</v-container>
</template>

<script>
import axios from "axios";
import moment from "moment";

import ContributionModal from "./contribution-modal.vue";
import ContributionRemoveConfirm from "./contribution-remove-confirm.vue";
import UserSelect from "../components/user-select.vue";

export default {
	components: {
		ContributionModal,
		UserSelect,
		ContributionRemoveConfirm,
	},
	name: "contribution-page",
	data() {
		const INCREMENT = 250;

		return {
			maxheight: 170,
			form: {
				packs: [], // [{ key: 'all', selected: true }]
			},
			all_packs: "all",
			all_packs_display: "All",
			contributors: [],
			selectedContributors: [],
			packToCode: {},
			logos: {},
			search: {
				searching: false,
				search_results: [],
			},
			textureSearch: "",
			displayedResults: INCREMENT,
			newSubmit: false,
			remove: {
				confirm: false,
				data: {},
			},
		};
	},
	computed: {
		queryToIds() {
			if (this.$route.query.ids) return this.$route.query.ids.split("-");

			// use the logged user as default selected contributor
			return [];
		},
		idsToQuery() {
			return {
				ids: this.selectedContributors.join("-"),
			};
		},
		searchDisabled() {
			const resSelected = this.form.packs.reduce((a, c) => a || c.selected, false) === false;
			const invalidTextSearch =
				this.textureSearch.length < 3 && Number.isNaN(Number.parseInt(this.textureSearch));
			const result =
				this.search.searching ||
				resSelected ||
				(this.selectedContributors.length === 0 && invalidTextSearch);
			return result;
		},
		listColumns() {
			let columns = 1;

			if (this.$vuetify.breakpoint.mdAndUp && this.contributors.length >= 6) {
				columns = 2;
				if (this.$vuetify.breakpoint.lgAndUp && this.contributors.length >= 21) {
					columns = 3;
				}
			}

			return columns;
		},
		multiple() {
			return this.newSubmit;
		},
		packsSelected() {
			return this.form.packs.filter((entry) => entry.selected);
		},
		packsToChoose() {
			return (
				this.form.packs
					.filter((entry) => entry.key !== this.all_packs)
					// format into list-suitable format
					.map((v) => ({ label: v.value, value: v.key }))
			);
		},
		splitResults() {
			const res = [];
			for (let col = 0; col < this.listColumns; ++col) {
				res.push([]);
			}

			let arrayIndex = 0;
			this.search.search_results.forEach((contrib) => {
				res[arrayIndex].push(contrib);
				arrayIndex = (arrayIndex + 1) % this.listColumns;
			});

			return res;
		},
		onModalSubmit() {
			return this.newSubmit ? this.onNewSubmit : this.onChangeSubmit;
		},
	},
	methods: {
		// expose for inline use
		moment,
		showMore() {
			this.displayedResults += 100;
		},
		getPacks() {
			axios.get(`${this.$root.apiURL}/packs/search?type=submission`).then((res) => {
				Object.values(res.data).forEach((r) => {
					this.addPack(r.id, r.name);
					this.logos[r.id] = r.logo;
				});
			});
		},
		getAuthors() {
			axios
				.get(`${this.$root.apiURL}/contributions/authors`)
				.then((res) => {
					// assign the result, but sorted by username
					this.contributors = res.data.sort((a, b) => {
						if (!a.username && !b.username) return 0;
						if (a.username && !b.username) return 1;
						if (!a.username && b.username) return -1;

						return a.username.toLowerCase() > b.username.toLowerCase()
							? 1
							: b.username.toLowerCase() > a.username.toLowerCase()
								? -1
								: 0;
					});
				})
				.catch(console.trace);
		},
		addPack(name, value, selected = false) {
			this.form.packs.push({
				key: name,
				value: value,
				selected,
			});
		},
		openAdd() {
			this.newSubmit = true;
			this.$nextTick(() => {
				this.$refs.mod.open(undefined, this.packsToChoose, true);
			});
		},
		startSearch() {
			this.search.searching = true;
			Promise.all([
				axios.get(
					`${this.$root.apiURL}/contributions/search
	?packs=${this.packsSelected.map((r) => r.key).join("-")}
	&users=${this.selectedContributors.join("-")}
	&search=${this.textureSearch}`,
				),
				axios.get(`${this.$root.apiURL}/textures/raw`),
			])
				.then(([contributions, textures]) => {
					this.search.search_results = contributions.data
						.sort((a, b) => b.date - a.date)
						.map((c) => ({
							...c,
							url: `${this.$root.apiURL}/textures/${c.texture}/url/${c.pack}/latest`,
							name: textures.data[c.texture]?.name || "",
						}));
				})
				.finally(() => (this.search.searching = false))
				.catch((err) => this.$root.showSnackBar(err, "error"));
		},
		editContribution(contrib) {
			this.newSubmit = false;
			this.$refs.mod.open(contrib, this.packsToChoose, false);
		},
		/**
		 * @typedef MultipleContribution
		 * @type {object}
		 * @property {string[]} authors Author id array
		 * @property {string[]?} packs Resource pack name array
		 * @property {string} pack Contribution resource pack
		 * @property {string} date Contribution date
		 * @property {Array<number|[number, number]>} texture Texture range array
		 */
		/**
		 * @param {Array<MultipleContribution>} entries Input entries
		 * @returns {Promise<void>}
		 */
		async onNewSubmit(entries) {
			if (!Array.isArray(entries)) return;

			// prepare final data
			let final_contributions = [];
			for (const entry of entries) {
				const generated_range = window.generateRange(entry.texture);

				if (generated_range.length === 0) {
					this.$root
						.jsonSnackBar(entry)
						.showSnackBar(this.$root.lang("database.labels.id_field_errors.one_required"), "error");
					console.error(entry);
					return false;
				}

				if (entry.authors.length === 0) {
					this.$root
						.jsonSnackBar(entry)
						.showSnackBar(this.$root.lang("database.subtitles.no_contributor_yet"), "error");
					console.error(entry);
					return false;
				}

				for (const texture_id of generated_range) {
					const new_contribution = {
						date: new Date(entry.date).getTime(),
						pack: entry.pack,
						authors: entry.authors,
						texture: String(texture_id),
					};
					final_contributions.push(new_contribution);
				}
			}

			let i = 0;
			let went_well = true;
			while (went_well && i < final_contributions.length) {
				went_well = await axios
					.post(`${this.$root.apiURL}/contributions`, final_contributions[i], this.$root.apiOptions)
					.then((_created_contribution) => {
						return true;
					})
					.catch((err) => {
						this.$root.showSnackBar(err, "error");
						console.error(final_contributions[i]);
						return false;
					});

				i++;
			}

			if (went_well) {
				this.$root.showSnackBar(this.$root.lang("global.ends_success"), "success");
				this.getAuthors();
			}

			return went_well;
		},
		onPackChange(selected, key) {
			if (key === this.all_packs) {
				if (selected) {
					// just checked all, uncheck others
					// better to make all of them not selected instead of replacing data
					// more stable if more data in entries
					this.form.packs.forEach((entry) => {
						if (entry.key === this.all_packs) return;

						entry.selected = false;
					});
				} else {
					this.onPackUnselected(key);
				}
			} else {
				// other pack
				if (selected) {
					// uncheck all
					const index_all = this.form.packs.findIndex((entry) => entry.key === this.all_packs);
					this.form.packs[index_all].selected = false;
				} else {
					this.onPackUnselected(key);
				}
			}
		},
		onPackUnselected(key) {
			// ensure at least one selected
			if (this.packsSelected.length === 0) {
				const index_entry = this.form.packs.findIndex((entry) => entry.key === key);

				// needs to be changed on next tick, cannot change same data on same cycle
				this.$nextTick(() => {
					this.$set(this.form.packs[index_entry], "selected", true);
				});
			} else {
				// do nothing, at least one is selected
			}
		},
		onChangeSubmit(data) {
			axios
				.put(
					`${this.$root.apiURL}/contributions/${data.id}`,
					{
						date: data.date,
						pack: data.pack,
						authors: data.authors,
						texture: String(data.texture),
					},
					this.$root.apiOptions,
				)
				.then(() => {
					this.$refs.mod.close();
					this.$root.showSnackBar(this.$root.lang().global.ends_success, "success");
					this.startSearch();
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
				});
		},
		deleteContribution(data) {
			this.remove.data = data;
			this.remove.confirm = true;
		},
		close(refresh = false) {
			this.remove.confirm = false;
			if (refresh) this.startSearch();
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
			this.packToCode = Object.values(res.data).reduce((acc, cur) => {
				acc[cur.id] = cur.name
					.split(" ")
					// Classic Faithful 32x Programmer Art -> CF32PA
					.map((el) => (isNaN(Number(el[0])) ? el[0].toUpperCase() : el.match(/\d+/g)?.[0]))
					.join("");
				return acc;
			}, {});
		});
		this.selectedContributors = this.queryToIds;
		this.addPack(this.all_packs, this.all_packs_display, true);
		window.eventBus.$on("newContributor", (l) => {
			this.contributors = l;
		});
	},
	mounted() {
		this.getPacks();
		this.getAuthors();
	},
	watch: {
		contributors: {
			handler(contributors) {
				// FIX BUG WHERE USERS WITH NO CONTRIBUTIONS GET INCLUDED IN SEARCH
				const contributors_id = contributors.map((c) => c.id);
				this.selectedContributors = this.selectedContributors.filter((c) =>
					contributors_id.includes(c),
				);
			},
			deep: true,
		},
	},
};
</script>
