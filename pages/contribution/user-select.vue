<template>
	<v-autocomplete
		v-bind="$attrs"
		v-model="content"
		:items="contributorList"
		:loading="contributors.length == 0 || isSearching"
		:search-input.sync="search"
		item-text="username"
		item-value="id"
		:placeholder="$root.lang().database.labels.one_contributor"
		multiple
		:dense="dense"
		:error-messages="
			content.length === 0 ? [$root.lang('database.subtitles.no_contributor_yet')] : []
		"
		chips
	>
		<!-- SELECTED THINGY -->
		<template v-slot:selection="data">
			<v-chip
				:key="data.item.id"
				v-bind="data.attrs"
				:input-value="data.selected"
				:disabled="data.disabled"
				close
				@click:close="remove(data.item.id)"
				v-if="!limit || data.index < limit"
			>
				<v-avatar :class="{ accent: data.item.uuid == undefined, 'text--white': true }" left>
					<template v-if="data.item.uuid != undefined">
						<v-img
							eager
							:src="'https://visage.surgeplay.com/face/24/' + data.item.uuid"
							:alt="(data.item.username || '' + data.item.id).slice(0, 1)"
						/>
					</template>
					<template v-else>
						{{ (data.item.username || "" + data.item.id).slice(0, 1) }}
					</template>
				</v-avatar>
				{{ data.item.username || data.item.id }}
			</v-chip>
			<span
				v-else-if="!limit || data.index == limit"
				v-text="'+ ' + String(content.length - limit)"
			/>
		</template>
		<!-- LIST ITEM PART -->
		<template v-slot:item="data">
			<template
				v-if="data.item && data.item.constructor && data.item.constructor.name === 'String'"
			>
				<v-list-item-content v-text="data.item"></v-list-item-content>
			</template>
			<template v-else>
				<v-list-item-content>
					<v-list-item-title
						v-text="
							data.item.username ||
							$root.lang().database.labels.anonymous + ' (' + data.item.id + ')'
						"
					>
					</v-list-item-title>
				</v-list-item-content>
				<v-list-item-avatar :style="{ background: data.item.uuid ? 'transparent' : '#4e4e4e' }">
					<template v-if="data.item.uuid">
						<v-img eager :src="'https://visage.surgeplay.com/head/48/' + data.item.uuid" />
					</template>
					<div v-else>{{ (data.item.username || "" + data.item.id).slice(0, 1) }}</div>
				</v-list-item-avatar>
			</template>
		</template>
		<template v-slot:no-data>
			<v-btn block elevation="0" color="primary" @click="() => startSearch(search)" class="mt-4">
				{{ $root.lang("database.subtitles.search") }} <v-icon right dark>mdi-magnify</v-icon>
			</v-btn>
		</template>
	</v-autocomplete>
</template>

<script>
import Vue from "vue";
import axios from "axios";

const SEARCH_DELAY = 300;

export default {
	name: "user-select",
	props: {
		contributors: {
			required: true,
			type: Array,
		},
		value: {
			required: true,
		},
		dense: {
			type: Boolean,
			required: false,
			default: () => false,
		},
		limit: {
			type: Number,
			required: false,
			default: () => 0,
		},
	},
	computed: {
		contributorList() {
			return [...this.contributors, ...Object.values(this.loadedContributors)];
		},
	},
	data() {
		return {
			content: this.value,
			search: null,
			isSearching: false,
			searchTimeout: undefined,
			previousSearches: [],
			loadedContributors: {},
		};
	},
	watch: {
		value: {
			handler(n, o) {
				if (JSON.stringify(n) !== JSON.stringify(o)) this.content = n;
			},
			immediate: true,
			deep: true,
		},
		content: {
			handler(n) {
				this.$emit("input", n);
			},
			deep: true,
		},
		search(val) {
			if (!val) return;

			if (this.searchTimeout) {
				clearTimeout(this.searchTimeout);
			}

			this.searchTimeout = setTimeout(() => {
				this.searchTimeout = undefined;
				this.startSearch(val);
			}, SEARCH_DELAY);
		},
		loadedContributors: {
			handler(n) {
				window.eventBus.$emit("newContributor", this.contributorList);
			},
			deep: true,
		},
	},
	methods: {
		remove(id) {
			const index = this.content.indexOf(id);
			if (index >= 0) this.content.splice(index, 1);
		},
		startSearch(val) {
			val = val.trim();

			// limit search on client and server side
			if (val.length < 3) return;

			// make search only if not searched before
			let alreadySearched = false;
			let i = 0;
			while (i < this.previousSearches.length && !alreadySearched) {
				alreadySearched = this.previousSearches[i].includes(val);
				++i;
			}
			if (alreadySearched) return;

			this.previousSearches.push(val);
			this.isSearching = true;

			axios
				.get(
					// we can assume contribution editors are admin
					`${this.$root.apiURL}/users/role/all/${val}`,
					this.$root.apiOptions,
				)
				.then((res) => {
					const results = res.data;
					results.forEach((result) => {
						// in case some clever guy forgot its username or uuid or anything
						Vue.set(
							this.loadedContributors,
							result.id,
							Object.merge(
								{
									username: "",
									uuid: "",
									type: [],
									media: [],
								},
								result,
							),
						);
					});
				})
				.catch((err) => {
					this.$root.showSnackBar(err, "error");
					console.error(err);
				})
				.finally(() => {
					this.isSearching = false;
				});
		},
	},
};
</script>
