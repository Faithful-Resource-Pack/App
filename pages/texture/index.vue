<template>
	<v-container id="texturePage">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />

		<!-- main button modals -->
		<new-texture-modal v-model="newTextureModalOpen" :color="pageColor" :tags="tags" />
		<rename-version-modal v-model="renameVersionModalOpen" :color="pageColor" />
		<add-version-modal v-model="addVersionModalOpen" :color="pageColor" />
		<merge-texture-modal v-model="mergeModalOpen" :color="pageColor" />

		<!-- per-texture edit/delete modals -->
		<texture-modal
			v-model="editModal.open"
			:color="pageColor"
			:add="!Object.keys(editModal.data).length"
			:data="editModal.data"
			:tags="tags"
			@close="closeTextureModal"
		/>
		<texture-remove-confirm
			v-model="remove.open"
			type="texture"
			:data="remove.data"
			:on-submit="removeTexture"
		/>

		<div class="text-h4 py-4">
			{{ $root.lang().database.textures.title }}
		</div>
		<div class="my-2 text-h5">{{ $root.lang().database.textures.tag_filter }}</div>
		<div class="selector">
			<v-btn
				v-for="textureTag in textureTags"
				:key="textureTag"
				:class="['my-1 mr-2', activeTag(textureTag)]"
				:to="textureURL(textureTag)"
				:exact="textureTag == 'all'"
			>
				{{ textureTag }}
			</v-btn>
		</div>
		<div class="my-2 text-h5">{{ $root.lang().database.search }}</div>
		<div class="my-2">
			<search-box
				v-model="search"
				:color="pageColor"
				:placeholder="$root.lang().database.users.search_texture"
				@search="startSearch"
				@clear="clearSearch"
			/>
		</div>

		<div class="my-6">
			<v-row>
				<v-col>
					<v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openNewTextureModal">
						{{ $root.lang().database.textures.add_multiple }}
						<v-icon right>mdi-plus</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<br />
			<v-row>
				<v-col>
					<v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openAddVersionModal">
						{{ $root.lang().database.textures.add_version.title }}
						<v-icon right>mdi-pencil-plus</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-btn
						block
						:color="pageColor"
						:class="[textColorOnPage]"
						@click="openRenameVersionModal"
					>
						{{ $root.lang().database.textures.rename_version.title }}
						<v-icon right>mdi-pencil</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-btn block :color="pageColor" :class="[textColorOnPage]" @click="openMergeModal">
						{{ $root.lang().database.textures.merge_textures.title }}
						<v-icon right>mdi-merge</v-icon>
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
import SearchBox from "@components/search-box.vue";

import TextureModal from "./texture-modal.vue";
import NewTextureModal from "./new-texture-modal/index.vue";
import RenameVersionModal from "./rename-version-modal.vue";
import AddVersionModal from "./add-version-modal.vue";
import MergeTextureModal from "./merge-texture-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";

import { updatePageStyles } from "@helpers/colors.js";

export default {
	name: "texture-page",
	components: {
		SmartGrid,
		SearchBox,
		TextureModal,
		RenameVersionModal,
		NewTextureModal,
		AddVersionModal,
		MergeTextureModal,
		TextureRemoveConfirm,
	},
	data() {
		return {
			pageColor: "blue darken-1",
			pageStyles: "",
			textColorOnPage: "white--text",
			addVersionModalOpen: false,
			newTextureModalOpen: false,
			tags: [],
			textures: {},
			search: "",
			renameVersionModalOpen: false,
			mergeModalOpen: false,
			editModal: {
				open: false,
				data: {},
			},
			remove: {
				open: false,
				data: {},
			},
			selectTextureTag: "all",
		};
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
			// provided name is prioritized
			if (name) return `/textures/${t}/${name}`;
			if (this.name) return `/textures/${t}/${this.name}`;
			// no texture searched, remove name param
			return `/textures/${t}`;
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
			this.editModal.open = true;
			this.editModal.data = data;
		},
		closeTextureModal(refresh = false) {
			this.editModal.open = false;
			if (refresh) {
				this.getTags();
				this.getTextures();
			}
		},
		openAddVersionModal() {
			this.addVersionModalOpen = true;
		},
		openRenameVersionModal() {
			this.renameVersionModalOpen = true;
		},
		openNewTextureModal() {
			this.newTextureModalOpen = true;
		},
		openMergeModal() {
			this.mergeModalOpen = true;
		},
		askRemove(data) {
			this.remove.open = true;
			this.remove.data = data;
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
		getTextures() {
			const url = new URL(`${this.$root.apiURL}/textures/search`);
			const { tag, name } = this.$route.params;
			if (tag && tag !== "all") url.searchParams.set("tag", tag);
			if (name) url.searchParams.set("name", name.replace(/ /g, "_"));
			axios
				.get(url.toString())
				.then((res) => {
					this.textures = res.data;
				})
				.catch((err) => console.error(err));
		},
		update(textures = true) {
			if (textures) this.getTextures();
			this.getTags();
		},
		async removeTexture(data) {
			const textureId = data.id;
			await axios.delete(`${this.$root.apiURL}/textures/${textureId}`, this.$root.apiOptions);
			this.startSearch();
		},
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
		this.update();
		updatePageStyles(this);
	},
};
</script>
