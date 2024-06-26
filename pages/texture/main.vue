<template>
	<v-container id="texturePage">
		<div class="styles" v-html="pageStyles" />
		<texture-modal
			:color="pageColor"
			:textColor="textColorOnPage"
			v-model="textureModalOpen"
			@close="closeTextureModal"
			:add="Object.keys(dialogData).length == 0"
			:data="dialogData"
			:tags="tags"
		/>
		<new-texture-modal
			:textColor="textColorOnPage"
			:color="pageColor"
			v-model="newTextureModalOpen"
			:tags="tags"
			:editions="editions"
			:versions="versions"
		/>
		<modify-version-modal
			:color="pageColor"
			v-model="modifyVersionModalOpen"
			@close="
				() => {
					modifyVersionModalOpen = false;
				}
			"
		/>
		<add-version-modal
			:color="pageColor"
			v-model="addVersionModalOpen"
			@close="
				() => {
					addVersionModalOpen = false;
				}
			"
			:editions="editions"
			:versions="versions"
		/>
		<texture-remove-confirm
			type="texture"
			v-model="remove.confirm"
			:data="remove.data"
			@close="
				() => {
					remove.confirm = false;
				}
			"
			:on-submit="removeTexture"
		/>

		<div class="text-h4 py-4">
			{{ $root.lang().database.titles.textures }}
		</div>
		<div class="my-2 text-h5">{{ $root.lang().database.labels.select_texture_tag }}</div>
		<div v-if="$vuetify.breakpoint.smAndUp" class="selector">
			<v-btn
				v-for="tag in textureTags"
				:key="tag"
				:class="['my-1 mr-2', activeTag(tag)]"
				:to="textureURL(tag)"
				:exact="tag == 'all'"
			>
				{{ tag }}
			</v-btn>
		</div>
		<v-select
			id="selectTextureTag"
			v-else
			:items="
				textureTags.map((e) => {
					return { text: e.toUpperCase(), value: e };
				})
			"
			item-text="text"
			item-value="value"
			:color="pageColor"
			:item-color="pageColor"
			filled
			v-model="selectTextureTag"
		/>
		<div class="mt-4 mb-2 text-h5">{{ $root.lang().database.subtitles.search }}</div>
		<div class="my-2">
			<v-text-field
				v-model="search"
				:append-outer-icon="search ? 'mdi-send' : undefined"
				filled
				clear-icon="mdi-close"
				clearable
				:color="pageColor"
				:placeholder="$root.lang().database.labels.search_texture"
				type="text"
				@keyup.enter="startSearch"
				@click:append-outer="startSearch"
				@click:clear="clearSearch"
			/>
		</div>

		<div>
			<v-row>
				<v-col>
					<v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openNewTextureModal()">
						{{ $root.lang().database.labels.add_texture }} <v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<br />
			<v-row>
				<v-col>
					<v-btn
						block
						:color="pageColor"
						:class="[textColorOnPage]"
						@click="
							() => {
								addVersionModalOpen = true;
							}
						"
					>
						{{ $root.lang().database.labels.add_mc_version }}<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-btn
						block
						:color="pageColor"
						:class="[textColorOnPage]"
						@click="openModifyVersionModal()"
					>
						{{ $root.lang().database.labels.edit_mc_version }}<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-col>
			</v-row>

			<div class="mt-4 mb-2 text-h5">{{ $root.lang().database.subtitles.texture_result }}</div>
			<div v-if="Object.keys(textures).length" class="main-container pb-4 rounded">
				<v-row class="mb-1 mt-0">
					<v-col
						:cols="12 / listColumns"
						xs="1"
						class="py-0"
						v-for="(textures_arr, index) in splitResults"
						:key="index"
					>
						<v-list two-line style="padding-top: 1px; padding-bottom: 1px; background: transparent">
							<v-list-item v-for="texture in textures_arr" class="my-4" :key="texture.id">
								<a :href="`/gallery?show=${texture.id}`">
									<v-list-item-avatar tile class="texture-avatar my-0 text--primary">
										{{ texture.id }}
									</v-list-item-avatar>
								</a>

								<v-list-item-content class="py-0">
									<v-list-item-title>{{ texture.name }}</v-list-item-title>
									<v-list-item-subtitle>{{ (texture.tags || []).join(", ") }}</v-list-item-subtitle>
								</v-list-item-content>

								<v-list-item-action class="merged">
									<v-btn icon @click="openTextureModal(texture)">
										<v-icon color="lighten-1">mdi-pencil</v-icon>
									</v-btn>
									<v-btn icon @click="askRemove(texture)">
										<v-icon color="red lighten-1">mdi-delete</v-icon>
									</v-btn>
								</v-list-item-action>
							</v-list-item>
						</v-list>
					</v-col>
				</v-row>

				<v-btn
					:style="{ margin: 'auto', 'min-width': '250px !important' }"
					:disabled="displayedResults >= Object.keys(textures).length"
					:color="pageColor"
					:class="textColorOnPage"
					block
					@click="showMore()"
					:v-if="displayedResults < Object.keys(textures).length"
					elevation="2"
				>
					{{ $root.lang().global.btn.load_more }}
				</v-btn>
			</div>
			<div v-else>
				<br />
				<p>
					<i>{{ $root.lang().global.no_results }}</i>
				</p>
			</div>
		</div>
	</v-container>
</template>

<script>
import axios from "axios";

import TextureModal from "./texture-modal.vue";
import NewTextureModal from "./new-texture-modal.vue";
import ModifyVersionModal from "./modify-version-modal.vue";
import AddVersionModal from "./add-version-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";

export default {
	name: "texture-page",
	components: {
		TextureModal,
		ModifyVersionModal,
		NewTextureModal,
		AddVersionModal,
		TextureRemoveConfirm,
	},
	data() {
		const INCREMENT = 250;

		return {
			pageColor: "blue darken-1",
			pageStyles: "",
			textColorOnPage: "white--text",
			addVersionModalOpen: false,
			newTextureModalOpen: false,
			recompute: false,
			tags: [],
			editions: [],
			versions: [],
			textures: {},
			search: "",
			textureModalOpen: false,
			modifyVersionModalOpen: false,
			dialogData: {},
			remove: {
				confirm: false,
				data: {},
			},
			displayedResults: INCREMENT,
			selectTextureTag: "all",
		};
	},
	computed: {
		textureTags() {
			return ["all", ...this.tags];
		},
		tag() {
			if (this.$route.params.tag && this.textureTags.includes(this.$route.params.tag))
				return this.$route.params.tag;
			return undefined;
		},
		name() {
			if (this.tag !== undefined) return this.$route.params.name;
			return this.$route.params.tag;
		},
		listColumns() {
			let columns = 1;

			if (this.$vuetify.breakpoint.mdAndUp && this.displayedResults >= 6) {
				columns = 2;
				if (this.$vuetify.breakpoint.lgAndUp && this.displayedResults >= 21) {
					columns = 3;
				}
			}

			if (Object.keys(this.textures).length === 1) columns = 1;

			return columns;
		},
		splitResults() {
			const res = [];

			const keys = Object.keys(this.textures);
			const len = keys.length;

			for (let col = 0; col < this.listColumns; ++col) res.push([]);

			let arrayIndex = 0;

			for (let i = 0; i < Math.min(this.displayedResults, len); i++) {
				res[arrayIndex].push(this.textures[keys[i]]);
				arrayIndex = (arrayIndex + 1) % this.listColumns;
			}

			return res;
		},
	},
	methods: {
		activeTag(t) {
			const result = {};

			result[`v-btn--active ${this.pageColor} ${this.textColorOnPage}`] =
				(t === "all" && !this.tag && !!this.name) ||
				(t && this.tag && t.toLowerCase() === this.tag.toLowerCase());

			return result;
		},
		textureURL(t, name = undefined) {
			return this.name || name
				? `/textures/${t}/${name !== undefined ? name : this.name}`
				: `/textures/${t}`;
		},
		startSearch() {
			const newPath = this.textureURL(this.tag, this.search);

			// don't change route if same path
			if (newPath !== this.$route.path) this.$router.push(newPath);
			// else get textures manually
			else this.getTextures();
		},
		clearSearch() {
			this.search = "";
			this.startSearch();
		},
		openTextureModal(data = {}) {
			this.textureModalOpen = true;
			this.dialogData = data;
		},
		closeTextureModal(refresh = false) {
			this.textureModalOpen = false;
			if (refresh) {
				this.getTags();
				this.getEditions();
				this.getTextures();
				this.getVersions();
			}
		},
		openModifyVersionModal() {
			this.modifyVersionModalOpen = true;
		},
		openNewTextureModal() {
			this.newTextureModalOpen = true;
		},
		askRemove(data) {
			this.remove.data = data;
			this.remove.confirm = true;
		},
		getTags() {
			axios
				.get(`${this.$root.apiURL}/textures/tags`)
				.then((res) => {
					this.tags = res.data;
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					this.$nextTick(() => {
						this.search = this.name;
					});
				});
		},
		getEditions() {
			axios
				.get(`${this.$root.apiURL}/textures/editions`)
				.then((res) => {
					this.editions = res.data;
				})
				.catch((err) => {
					console.error(err);
				});
		},
		getVersions() {
			axios
				.get(`${this.$root.apiURL}/textures/versions`)
				.then((res) => {
					this.versions = res.data;
				})
				.catch((err) => {
					console.error(err);
				});
		},
		getTextures() {
			const url = new URL(`${this.$root.apiURL}/textures/search`);
			if (this.$route.params.tag && this.$route.params.tag != "all")
				url.searchParams.set("tag", this.$route.params.tag);
			if (this.$route.params.name)
				url.searchParams.set("name", this.$route.params.name.replace(/ /g, "_"));
			axios
				.get(url.toString())
				.then((res) => {
					this.textures = res.data;
				})
				.catch((err) => console.error(err));
		},
		update(textures = true) {
			this.getTags();
			if (textures) this.getTextures();
			this.getEditions();
			this.getVersions();
		},
		showMore() {
			this.displayedResults += 100;
			this.update();
		},
		removeTexture(data) {
			const textureId = data.id;
			return axios
				.delete(`${this.$root.apiURL}/textures/${textureId}`, this.$root.apiOptions)
				.then(() => {
					this.startSearch();
				});
		},
	},
	watch: {
		$route() {
			this.getTextures();
		},
		tag(n) {
			this.selectTextureTag = n;
		},
		selectTextureTag(n) {
			if (n) this.$router.push(this.textureURL(n)).catch(() => {});
		},
	},
	mounted() {
		this.update(false);
		window.updatePageStyles(this);
	},
};
</script>
