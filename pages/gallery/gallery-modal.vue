<template>
	<v-dialog
		v-model="modalOpened"
		fullscreen
		hide-overlay
		transition="dialog-bottom-transition"
		@click.stop="() => closeModal()"
	>
		<v-card>
			<fullscreen-preview v-model="previewOpen" :src="clickedImage" :aspect-ratio="1 / 1" texture />

			<v-toolbar>
				<v-btn icon @click.stop="() => closeModal()">
					<v-icon>mdi-close</v-icon>
				</v-btn>
				<template v-if="Object.keys(textureObj).length > 0">
					<v-toolbar-title>[#{{ textureID }}] {{ textureObj.texture.name }}</v-toolbar-title>

					<v-spacer />

					<v-btn icon @click="() => $parent.copyShareLink(textureID)">
						<v-icon>mdi-share-variant</v-icon>
					</v-btn>
				</template>
				<template v-else>
					<v-toolbar-title>{{ $root.lang().global.loading }}</v-toolbar-title>
				</template>
			</v-toolbar>

			<div
				v-if="Object.keys(textureObj).length > 0"
				class="gallery-dialog-container d-sm-flex flex-column flex-sm-row pa-2 pa-sm-7"
			>
				<!-- image display -->
				<div
					class="gallery-dialog-textures d-sm-flex flex-row flex-sm-column overflow-auto mb-2 mb-sm-0 mx-n1 mx-sm-0"
				>
					<template v-for="group in grouped">
						<div class="d-flex flex-row pb-2 pb-sm-0">
							<template v-for="url in group">
								<div class="gallery-dialog-texture-container px-2 pb-sm-2" :key="url.name">
									<gallery-image
										modal
										:src="url.image"
										:textureID="textureID"
										:ignoreList="ignoreList"
										@click="openFullscreenPreview(url.image)"
									>
										<p>{{ $root.lang().gallery.error_message.texture_not_done }}</p>
									</gallery-image>
									<h2>{{ packToName[url.name] }}</h2>
								</div>
							</template>
						</div>
					</template>
				</div>

				<!-- texture details -->
				<div class="pl-sm-7">
					<v-tabs id="info-tabs" v-model="selectedTab" :show-arrows="false">
						<v-tabs-slider />

						<v-tab v-for="tab in tabs" :key="tab" style="text-transform: uppercase">
							{{ tab }}
						</v-tab>
					</v-tabs>

					<v-tabs-items v-model="selectedTab" class="info-table">
						<v-tab-item v-for="tab in tabs" :key="tab">
							<template v-if="tab === tabs.information">
								<template v-for="category in textureCategories">
									<div class="gallery-info">
										<h2>{{ $root.lang().gallery.modal.info[category] }}</h2>
										<v-data-table
											dense
											:headers="getHeaders(category)"
											:items="getItems(category)"
											class="elevation-1"
											style="margin-top: 10px"
											hide-default-footer
											disable-pagination
										>
											<template #item.versions="{ value }">
												<!-- title property gives alt text -->
												<span :title="value.join(', ')">{{ formatPathVersions(value) }}</span>
											</template>
											<!-- technically applies to both texture/use names but it doesn't matter -->
											<template #item.name="{ value }">
												<template v-if="value">{{ value }}</template>
												<i v-else>{{ $root.lang().database.labels.nameless }}</i>
											</template>
										</v-data-table>
									</div>
								</template>
							</template>
							<template v-if="tab === tabs.authors">
								<template v-for="{ category, packs } in authorCategories">
									<div class="gallery-info">
										<h2 style="text-transform: capitalize">{{ category }}</h2>
										<div class="double-table">
											<div v-for="pack in packs">
												<div class="title text-button text--secondary">
													{{ packToName[pack] }}
												</div>
												<v-data-table
													dense
													:headers="getHeaders(pack)"
													:items="getItems(pack)"
													class="elevation-1"
													style="margin-top: 10px"
													hide-default-footer
													disable-pagination
													:no-data-text="$root.lang().gallery.modal.no_contributions"
												/>
											</div>
										</div>
									</div>
								</template>
							</template>
						</v-tab-item>
					</v-tabs-items>
				</div>
			</div>
		</v-card>
	</v-dialog>
</template>

<script>
import moment from "moment";
import MinecraftSorter from "@helpers/MinecraftSorter";

import GalleryImage from "./gallery-image.vue";
import FullscreenPreview from "../components/fullscreen-preview.vue";

const PACK_GRID_ORDER = [
	["default", "faithful_32x", "faithful_64x"],
	["default", "classic_faithful_32x", "classic_faithful_64x"],
	["progart", "classic_faithful_32x_progart"],
];

const PACK_SLIDER_ORDER = [
	"default",
	"progart",
	"faithful_32x",
	"faithful_64x",
	"classic_faithful_32x",
	"classic_faithful_32x_progart",
	"classic_faithful_64x",
];

export default {
	name: "gallery-modal",
	components: {
		GalleryImage,
		FullscreenPreview,
	},
	props: {
		value: {
			type: Boolean,
			required: true,
		},
		textureID: {
			required: true,
		},
		textureObj: {
			type: Object,
			required: true,
		},
		contributors: {
			type: Object,
			required: true,
		},
		// saves on duplicate code, since it's already in the gallery page
		packToName: {
			type: Object,
			required: true,
		},
		// ignore list provided (already filtered by edition)
		ignoreList: {
			type: Array,
		},
	},
	data() {
		return {
			selectedTab: null,
			tabs: this.$root.lang().gallery.modal.tabs,
			textureCategories: ["texture", "uses", "paths"],
			authorCategories: [
				{
					category: "faithful",
					packs: ["faithful_32x", "faithful_64x"],
				},
				{
					category: "classic faithful jappa",
					packs: ["classic_faithful_32x", "classic_faithful_64x"],
				},
				{
					category: "classic faithful programmer art",
					packs: ["classic_faithful_32x_progart"],
				},
			],
			modalOpened: false,
			clickedImage: "",
			previewOpen: false,
		};
	},
	methods: {
		closeModal() {
			this.$emit("close");
			this.modalOpened = false;
		},
		discordIDtoName(d) {
			return this.contributors[d]
				? this.contributors[d].username || this.$root.lang().gallery.error_message.user_anonymous
				: this.$root.lang().gallery.error_message.user_not_found;
		},
		timestampToDate(t) {
			return moment(new Date(t)).format("ll");
		},
		getItems(item) {
			if (this.packs.includes(item))
				return this.textureObj.contributions
					.filter((el) => item === el.pack)
					.sort((a, b) => b.date - a.date)
					.map((el) => ({
						id: el.id,
						date: this.timestampToDate(el.date),
						contributors: el.authors.map((el) => this.discordIDtoName(el)).join(",\n"),
					}));
			switch (item) {
				case "texture":
					return [
						{
							...this.textureObj[item],
							tags: this.textureObj[item].tags.join(", "),
						},
					];
				case "uses":
					// no arrays to transform
					return Object.values(this.textureObj[item]);
				case "paths":
					return this.textureObj[item].map((path) => ({
						...path,
						// sort() mutates the original array so we need to clone it
						versions: Array.from(path.versions).sort(MinecraftSorter),
					}));
			}
		},
		formatPathVersions(versions) {
			if (versions.length === 1) return versions[0];
			return `${versions[0]} – ${versions[versions.length - 1]}`;
		},
		openFullscreenPreview(url) {
			this.clickedImage = url;
			this.previewOpen = true;
		},
		getHeaders(item) {
			if (this.packs.includes(item))
				return [
					{
						text: this.$root.lang().gallery.modal.data.contribution_id,
						value: "id",
					},
					{
						text: this.$root.lang().gallery.modal.data.date,
						value: "date",
					},
					{
						text: this.$root.lang().gallery.modal.data.authors,
						value: "contributors",
					},
				];
			switch (item) {
				case "texture":
					return [
						{
							text: this.$root.lang().gallery.modal.data.id,
							value: "id",
							sortable: false,
						},
						{
							text: this.$root.lang().gallery.modal.data.name,
							value: "name",
							sortable: false,
						},
						{
							text: this.$root.lang().gallery.modal.data.tags,
							value: "tags",
							sortable: false,
						},
					];
				case "uses":
					return [
						{
							text: this.$root.lang().gallery.modal.data.use_id,
							value: "id",
						},
						{
							text: this.$root.lang().gallery.modal.data.use_name,
							value: "name",
						},
						{
							text: this.$root.lang().gallery.modal.data.edition,
							value: "edition",
						},
					];
				case "paths":
					return [
						{
							text: this.$root.lang().gallery.modal.data.path_id,
							value: "id",
						},
						{
							text: this.$root.lang().gallery.modal.data.resource_pack_path,
							value: "name",
						},
						{
							text: this.$root.lang().gallery.modal.data.mc_versions,
							value: "versions",
						},
						{
							text: this.$root.lang().gallery.modal.data.use_id,
							value: "use",
						},
					];
			}
		},
	},
	computed: {
		infoText() {
			return {
				texture: this.$root.lang().gallery.modal.info.texture,
				uses: this.$root.lang().gallery.modal.info.uses,
				paths: this.$root.lang().gallery.modal.info.paths,
			};
		},
		packs() {
			return this.authorCategories.map((v) => v.packs).flat();
		},
		grouped() {
			if (!this.textureObj) return [];

			// don't display duplicates on mobile
			if (this.$vuetify.breakpoint.xsOnly)
				return [
					PACK_SLIDER_ORDER.map((pack) => ({ name: pack, image: this.textureObj.urls[pack] })),
				];

			return PACK_GRID_ORDER.map((packSet) =>
				packSet.map((pack) => {
					const url = this.textureObj.urls[pack];
					return { name: pack, image: url };
				}),
			);
		},
	},
	watch: {
		value: {
			handler(n) {
				this.modalOpened = n;
			},
			immediate: true,
		},
		modalOpened(n) {
			this.$emit("input", n);
		},
	},
};
</script>
