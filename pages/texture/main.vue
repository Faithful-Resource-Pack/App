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
			{{ $root.lang().database.textures.title }}
		</div>
		<div class="my-2 text-h5">{{ $root.lang().database.textures.tag_filter }}</div>
		<div class="selector">
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
		<div class="my-2 text-h5">{{ $root.lang().database.search }}</div>
		<div class="my-2">
			<v-text-field
				v-model="search"
				:append-outer-icon="search ? 'mdi-send' : undefined"
				filled
				clear-icon="mdi-close"
				clearable
				:color="pageColor"
				:placeholder="$root.lang().database.textures.search_texture"
				type="text"
				hide-details
				@keyup.enter="startSearch"
				@click:append-outer="startSearch"
				@click:clear="clearSearch"
			/>
		</div>

		<div class="my-6">
			<v-row>
				<v-col>
					<v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openNewTextureModal()">
						{{ $root.lang().database.textures.add_multiple }}<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<br />
			<v-row>
				<v-col>
					<v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openAddVersionModal">
						{{ $root.lang().database.textures.add_version.title }}<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-btn
						block
						:color="pageColor"
						:class="[textColorOnPage]"
						@click="openModifyVersionModal"
					>
						{{ $root.lang().database.textures.modify_version.title }}<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-col>
			</v-row>
		</div>

		<div class="my-2 text-h5">{{ $root.lang().database.textures.texture_result }}</div>
		<smart-grid
			v-if="Object.keys(textures).length"
			:pageColor="pageColor"
			:textColor="textColorOnPage"
			:items="Object.values(textures)"
			track="id"
		>
			<template #default="{ item }">
				<a :href="`/gallery?show=${item.id}`" target="_blank">
					<v-list-item-avatar tile class="database-list-avatar text--primary">
						{{ item.id }}
					</v-list-item-avatar>
				</a>

				<v-list-item-content>
					<v-list-item-title>{{ item.name }}</v-list-item-title>
					<v-list-item-subtitle>{{ (item.tags || []).join(", ") }}</v-list-item-subtitle>
				</v-list-item-content>

				<v-list-item-action class="merged">
					<v-btn icon @click="openTextureModal(item)">
						<v-icon color="lighten-1">mdi-pencil</v-icon>
					</v-btn>
					<v-btn icon @click="askRemove(item)">
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

import SmartGrid from "@components/smart-grid.vue";

import TextureModal from "./texture-modal.vue";
import NewTextureModal from "./new-texture-modal.vue";
import ModifyVersionModal from "./modify-version-modal.vue";
import AddVersionModal from "./add-version-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";

import { updatePageStyles } from "@helpers/colors.js";

export default {
	name: "texture-page",
	components: {
		SmartGrid,
		TextureModal,
		ModifyVersionModal,
		NewTextureModal,
		AddVersionModal,
		TextureRemoveConfirm,
	},
	data() {
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
		openAddVersionModal() {
			this.addVersionModalOpen = true;
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
		updatePageStyles(this);
	},
};
</script>
