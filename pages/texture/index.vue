<template>
	<v-container id="texturePage">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="styles" v-html="pageStyles" />
		<texture-modal
			v-model="textureModalOpen"
			:color="pageColor"
			:textColor="textColorOnPage"
			:add="!Object.keys(modalData).length"
			:data="modalData"
			:tags="tags"
			@close="closeTextureModal"
		/>
		<new-texture-modal
			v-model="newTextureModalOpen"
			:color="pageColor"
			:tags="tags"
			:versions="versions"
		/>
		<rename-version-modal
			v-model="renameVersionModalOpen"
			:color="pageColor"
			:versions="versions"
			@close="
				() => {
					renameVersionModalOpen = false;
				}
			"
		/>
		<add-version-modal
			v-model="addVersionModalOpen"
			:color="pageColor"
			:versions="versions"
			@close="
				() => {
					addVersionModalOpen = false;
				}
			"
		/>
		<texture-remove-confirm
			v-model="remove.confirm"
			type="texture"
			:data="remove.data"
			:on-submit="removeTexture"
			@close="
				() => {
					remove.confirm = false;
				}
			"
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
			<v-text-field
				v-model="search"
				:append-outer-icon="search && 'mdi-send'"
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
						@click="openRenameVersionModal"
					>
						{{ $root.lang().database.textures.rename_version.title }}<v-icon right>mdi-plus</v-icon>
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
import NewTextureModal from "./new-texture-modal/index.vue";
import RenameVersionModal from "./rename-version-modal.vue";
import AddVersionModal from "./add-version-modal.vue";
import TextureRemoveConfirm from "./texture-remove-confirm.vue";

import { updatePageStyles } from "@helpers/colors.js";

export default {
	name: "texture-page",
	components: {
		SmartGrid,
		TextureModal,
		RenameVersionModal,
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
			textures: {},
			search: "",
			textureModalOpen: false,
			renameVersionModalOpen: false,
			modalData: {},
			remove: {
				confirm: false,
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
			this.modalData = data;
		},
		closeTextureModal(refresh = false) {
			this.textureModalOpen = false;
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
		versions() {
			// saves a db request to reuse cached settings
			return Object.values(settings.versions).flat();
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
