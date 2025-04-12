<template>
	<fullscreen-modal
		v-model="modalOpened"
		:title="$root.lang().database.textures.add_multiple"
		:pageColor="color"
		@close="closeModal"
	>
		<template #toolbar>
			<v-btn icon @click="copyData"><v-icon>mdi-content-copy</v-icon></v-btn>
			<v-btn icon @click="openJSONModal"><v-icon>mdi-code-json</v-icon></v-btn>
		</template>
		<json-modal v-model="jsonModalOpened" :color="color" initialValue="[]" @data="parseJSON" />
		<div class="px-10 py-5">
			<v-row>
				<v-col cols="12" :md="$vuetify.breakpoint.lgAndUp ? 9 : 8">
					<v-tabs :color="color" v-model="selectedTab" :show-arrows="false">
						<v-tab
							v-for="(texture, i) in textures"
							:key="texture.key"
							style="text-transform: uppercase"
							append
						>
							<span v-if="texture.name">{{ texture.name }}</span>
							<i v-else>{{ $root.lang().database.nameless }}</i>
							<v-btn :color="color" icon @click="deleteTexture(i)">
								<v-icon>mdi-minus</v-icon>
							</v-btn>
						</v-tab>
						<v-btn text large color="grey darken-1" @click="addTexture()">
							{{ $root.lang().global.btn.add }}<v-icon right>mdi-plus</v-icon>
						</v-btn>
					</v-tabs>
					<v-tabs-items v-model="selectedTab" fixed-tabs>
						<texture-panel
							v-for="(texture, i) in textures"
							v-model="textures[i]"
							:key="texture.key"
							:color="color"
							:tags="tags"
							:versions="versions"
						/>
					</v-tabs-items>
				</v-col>
				<v-divider v-if="$vuetify.breakpoint.mdAndUp" vertical class="ma-5" />
				<v-col cols="12" v-else>
					<v-divider class="mx-5 my-0" />
				</v-col>
				<v-col>
					<v-list>
						<div class="font-weight-medium text--secondary my-2">
							{{ $root.lang().database.summary }}: [{{ textures.length }}]
						</div>
						<summary-item
							v-for="(tex, i) in textures"
							:texture="tex"
							:key="tex.key"
							:color="color"
							@delete="deleteTexture(i)"
						/>
					</v-list>
					<v-divider class="ma-5" />
					<v-row no-gutters>
						<v-col cols="12" sm="6">
							<v-checkbox
								v-model="clearOnSave"
								:color="color"
								hide-details
								:label="$root.lang().database.textures.modal.clear_on_save"
							/>
						</v-col>
						<v-col cols="12" sm="3">
							<v-btn class="px-1" color="red darken-1" text @click="resetModal">
								{{ $root.lang().global.btn.discard }}
							</v-btn>
						</v-col>
						<v-col cols="12" sm="3">
							<v-btn class="px-1" color="darken-1" text @click="send">
								{{ $root.lang().global.btn.save }}
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</div>
	</fullscreen-modal>
</template>

<script>
import { sortTags, emptyTexture } from "@helpers/textures";
import versionSorter from "@helpers/versionSorter";

import axios from "axios";

import FullscreenModal from "@components/fullscreen-modal.vue";
import JsonModal from "@components/json-modal.vue";
import TexturePanel from "./texture-panel.vue";
import SummaryItem from "./summary-item.vue";

const CLEAR_ON_SAVE_KEY = "new_textures_clear";

export default {
	name: "new-texture-modal",
	components: {
		FullscreenModal,
		TexturePanel,
		JsonModal,
		SummaryItem,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		color: {
			type: String,
			required: false,
			default: "primary",
		},
		tags: {
			type: Array,
			required: false,
			default: () => [],
		},
		versions: {
			type: Array,
			required: false,
			default: () => [],
		},
	},
	data() {
		return {
			modalOpened: false,
			selectedTab: null,
			textures: [emptyTexture()],
			jsonModalOpened: false,
			clearOnSave: localStorage.getItem(CLEAR_ON_SAVE_KEY) === "true",
		};
	},
	methods: {
		addTexture() {
			this.textures.push(emptyTexture());
			// change focused tab to new one
			this.$nextTick(() => {
				this.selectedTab = this.textures.length - 1;
			});
		},
		deleteTexture(index) {
			this.textures.splice(index, 1);
			// make sure there's at least one texture
			if (!this.textures.length) this.addTexture();
		},
		openJSONModal() {
			this.jsonModalOpened = true;
		},
		parseJSON(data) {
			if (typeof data === "object" && !Array.isArray(data)) data = [data];
			// validate parsed data
			const cleaned = data.map((tex) => {
				tex.key = crypto.randomUUID();
				tex.name ||= "";
				tex.tags ||= [];
				if (!tex.uses || !tex.uses.length) tex.uses = [emptyUse()];
				tex.uses = tex.uses.map((use) => {
					use.key = crypto.randomUUID();
					use.edition ||= "";
					if (!use.paths || !use.paths.length) use.paths = [emptyPath()];
					use.paths = use.paths.map((path) => {
						path.name ||= "";
						path.versions ||= [];
						path.mcmeta ||= false;
						return path;
					});
					return use;
				});
				return tex;
			});
			this.textures = cleaned;
			this.jsonModalOpened = false;
		},
		copyData() {
			const data = JSON.stringify(this.cleanedData, null, 2);
			navigator.clipboard.writeText(data);
			this.$root.showSnackBar(this.$root.lang().database.textures.modal.copy_json_data, "success");
		},
		resetModal() {
			this.textures = [emptyTexture()];
		},
		closeModal() {
			this.$emit("close");
			this.modalOpened = false;
		},
		send() {
			axios
				.post(`${this.$root.apiURL}/textures/multiple`, this.cleanedData, this.$root.apiOptions)
				.then(() => {
					this.$root.showSnackBar(this.$root.lang().database.textures.add_success, "success");
					if (this.clearOnSave) this.resetModal();
				})
				.catch((err) => {
					console.error(err);
					this.$root.showSnackBar(err, "error");
				});
		},
	},
	computed: {
		cleanedData() {
			// used for both copying and sending
			return this.textures.map((tex) => ({
				name: tex.name,
				tags: sortTags(tex.tags),
				uses: tex.uses.map((use) => ({
					name: use.name,
					edition: use.edition,
					paths: use.paths.map((path) => ({
						name: path.name,
						versions: Array.from(path.versions).sort(versionSorter),
						mcmeta: path.mcmeta || false,
					})),
				})),
			}));
		},
	},
	watch: {
		value(n) {
			this.modalOpened = n;
		},
		modalOpened(n) {
			this.$emit("input", n);
		},
		clearOnSave(n) {
			localStorage.setItem(CLEAR_ON_SAVE_KEY, n);
		},
	},
};
</script>
