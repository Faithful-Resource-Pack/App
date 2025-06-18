<template>
	<v-autocomplete
		v-model="content"
		:items="userList"
		:loading="users.length == 0 || isSearching"
		:search-input.sync="search"
		item-text="username"
		item-value="id"
		multiple
		:dense="dense"
		chips
		v-bind="$attrs"
	>
		<!-- SELECTED THINGY -->
		<template #selection="data">
			<v-chip
				v-if="!limit || data.index < limit"
				:key="data.item.id"
				:input-value="data.selected"
				:disabled="data.disabled"
				close
				v-bind="data.attrs"
				@click:close="remove(data.item.id)"
			>
				<v-avatar :class="{ accent: data.item.uuid == undefined, 'text--white': true }" left>
					<template v-if="data.item.uuid != undefined">
						<v-img
							eager
							:src="`https://vzge.me/face/24/${data.item.uuid}`"
							:alt="(data.item.username || '' + data.item.id).slice(0, 1)"
						/>
					</template>
					<template v-else>
						{{ (data.item.username || "" + data.item.id).slice(0, 1) }}
					</template>
				</v-avatar>
				{{ data.item.username || data.item.id }}
			</v-chip>
			<span v-else-if="!limit || data.index == limit">
				{{ "+ " + String(content.length - limit) }}
			</span>
		</template>
		<!-- LIST ITEM PART -->
		<template #item="data">
			<template
				v-if="data.item && data.item.constructor && data.item.constructor.name === 'String'"
			>
				<v-list-item-content>{{ data.item }}</v-list-item-content>
			</template>
			<template v-else>
				<v-list-item-content>
					<v-list-item-title>
						{{ data.item.username || $root.lang().database.anonymous + ` (${data.item.id})` }}
					</v-list-item-title>
					<v-list-item-subtitle v-if="data.item.contributions">
						{{ `${data.item.contributions} contribution${data.item.contributions > 1 ? "s" : ""}` }}
					</v-list-item-subtitle>
				</v-list-item-content>
				<v-list-item-avatar :style="{ background: data.item.uuid ? 'transparent' : '#4e4e4e' }">
					<template v-if="data.item.uuid">
						<v-img eager :src="`https://vzge.me/head/48/${data.item.uuid}`" />
					</template>
					<div v-else>{{ (data.item.username || "" + data.item.id).slice(0, 1) }}</div>
				</v-list-item-avatar>
			</template>
		</template>
		<template #no-data>
			<v-btn block elevation="0" color="primary" class="mt-4" @click="() => startSearch(search)">
				{{ $root.lang().database.search }} <v-icon right dark>mdi-magnify</v-icon>
			</v-btn>
		</template>
	</v-autocomplete>
</template>

<script>
import axios from "axios";

const SEARCH_DELAY = 300;

export default {
	name: "user-select",
	props: {
		users: {
			type: Array,
			required: true,
		},
		value: {
			type: Array,
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
		userList() {
			return [...this.users, ...Object.values(this.loadedUsers)];
		},
	},
	data() {
		return {
			content: this.value,
			search: null,
			isSearching: false,
			searchTimeout: undefined,
			previousSearches: [],
			loadedUsers: {},
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
		loadedUsers: {
			handler(n) {
				this.$emit("newUser", this.userList);
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
				.get(`${this.$root.apiURL}/users/role/all/${val}`)
				.then((res) => {
					const results = res.data;
					results.forEach((result) => {
						// in case some clever guy forgot their username or uuid or whatever
						this.$set(
							this.loadedUsers,
							result.id,
							Object.merge(
								{
									username: "",
									uuid: "",
									roles: [],
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
