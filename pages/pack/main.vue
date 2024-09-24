<template>
	<v-container>
		<div class="styles" v-html="pageStyles" />
		<pack-modal
			:color="pageColor"
			v-model="dialogOpen"
			@close="close"
			:data="dialogData"
			:add="dialogDataAdd"
			:tags="tags"
		/>
		<pack-remove-confirm
			type="packs"
			v-model="remove.confirm"
			@close="
				() => {
					remove.confirm = false;
					startSearch();
				}
			"
			:id="remove.id"
			:label="remove.label"
		/>

		<v-row no-gutters class="py-0 mb-0" align="center">
			<v-col cols="12" sm="6" class="mt-4 py-sm-0">
				<div class="text-h4 py-4">
					{{ $root.lang().database.titles.packs }}
				</div>
			</v-col>
			<v-col cols="12" sm="6" class="mt-4 py-sm-0">
				<v-btn block :color="pageColor" @click="openDialog()">
					{{ $root.lang("database.labels.add_new_pack") }}<v-icon right dark>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>

		<!-- tag switcher -->
		<div class="my-2 text-h5">{{ $root.lang().database.labels.select_pack_tag }}</div>
		<div class="selector">
			<v-btn
				v-for="tag in packTags"
				:key="tag"
				:class="['my-1 mr-2', activeTag(tag)]"
				:to="packURL(tag)"
				:exact="tag == 'all'"
			>
				{{ formatTags(tag) }}
			</v-btn>
		</div>

		<!-- results -->
		<div class="my-2 text-h5">{{ $root.lang().database.subtitles.pack_result }}</div>
		<smart-grid
			v-if="packs.length"
			:items="packs"
			:pageColor="pageColor"
			:textColor="textColorOnPage"
			:max-columns="2"
			track="id"
		>
			<template #default="{ item }">
				<!-- for some reason .database-list-avatar isn't working here -->
				<v-list-item-avatar
					:style="{
						height: '64px',
						width: '64px',
						'min-width': '64px',
						'border-radius': '5px',
					}"
				>
					<v-img :src="item.logo" />
				</v-list-item-avatar>
				<v-list-item-content>
					<v-list-item-title>{{ item.name }}</v-list-item-title>
					<v-list-item-subtitle>
						{{ (item.tags.map(formatTags) || []).join(", ") }}
					</v-list-item-subtitle>
				</v-list-item-content>

				<!-- action buttons -->
				<v-list-item-action class="merged">
					<v-btn icon @click="openDialog(item)">
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn icon @click="askRemove(item)">
						<v-icon color="red lighten-1">mdi-delete</v-icon>
					</v-btn>
				</v-list-item-action>
			</template>
		</smart-grid>
		<div v-else class="text-center">
			<v-progress-circular indeterminate :color="pageColor" />
		</div>
	</v-container>
</template>

<script>
import axios from "axios";

import SmartGrid from "@components/smart-grid.vue";

import PackModal from "./pack-modal.vue";
import PackRemoveConfirm from "./pack-remove-confirm.vue";

export default {
	name: "pack-page",
	components: {
		SmartGrid,
		PackModal,
		PackRemoveConfirm,
	},
	data() {
		return {
			pageColor: "amber accent-4",
			pageStyles: "",
			search: "",
			textColorOnPage: "white--text",
			tags: [],
			packs: [],
			dialogOpen: false,
			dialogData: {},
			dialogDataAdd: false,
			remove: {
				id: "",
				label: "",
				confirm: false,
			},
		};
	},
	methods: {
		activeTag(t) {
			const result = {};
			result[`v-btn--active ${this.pageColor} ${this.textColorOnPage}`] =
				(t === "all" && !this.tag) || (t && this.tag && t.toLowerCase() === this.tag.toLowerCase());

			return result;
		},
		startSearch() {
			// change url to match
			const newPath = this.packURL(this.tag);
			if (newPath !== this.$route.path) return this.$router.push(newPath);

			// "all" tag searches everything
			const url = new URL(`${this.$root.apiURL}/packs/search`);
			if (this.tags.includes(this.$route.params.tag))
				url.searchParams.set("tag", this.$route.params.tag);

			axios
				.get(url.toString())
				.then((res) => {
					this.packs = res.data;
				})
				.catch((err) => console.error(err));
		},
		packURL(tag) {
			return `/packs/${tag || "all"}`;
		},
		formatTags(s) {
			return s
				.split("_")
				.map((p) => (p == "progart" ? "Programmer Art" : p.toTitleCase()))
				.join(" ");
		},
		openDialog(data = undefined) {
			this.dialogData = data;
			this.dialogDataAdd = data === undefined;
			this.dialogOpen = true;
		},
		close(refresh = false) {
			this.dialogOpen = false;
			// clear form
			this.dialogData = {};
			if (refresh) this.startSearch();
		},
		askRemove(data) {
			this.remove.id = data.id;
			this.remove.label = this.$root
				.lang()
				.database.labels.ask_deletion.replace("%s", data.name)
				.replace("%d", data.id);
			this.remove.confirm = true;
		},
	},
	computed: {
		packTags() {
			return ["all", ...this.tags];
		},
		tag() {
			return this.$route.params.tag || "all";
		},
	},
	mounted() {
		axios.get(`${this.$root.apiURL}/packs/tags`).then((res) => (this.tags = res.data));
		this.startSearch();
		window.updatePageStyles(this);
	},
	watch: {
		"$route.params": {
			handler(params, old) {
				// if hash changed but not params
				if (JSON.stringify(params) === JSON.stringify(old)) return;

				// search whenever the url changes (when tag is switched)
				this.startSearch();
			},
		},
	},
};
</script>
