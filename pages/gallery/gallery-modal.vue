<template>
	<v-dialog
		v-model="opened"
		fullscreen
		hide-overlay
		transition="dialog-bottom-transition"
		@click.stop="() => closeModal()"
	>
		<v-card>
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
					<template v-for="(group, i) in grouped">
						<div
							class="gallery-dialog-intern d-flex flex-row pb-2 pb-sm-0"
							:key="`dialog-intern-${i}`"
						>
							<template v-for="(url, j) in group">
								<div class="gallery-dialog-texture-container px-1 pb-sm-2" :key="`${i}-${j}`">
									<gallery-image
										modal
										:src="url.image"
										:textureID="textureID"
										:ignoreList="ignoreList"
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

						<v-tab v-for="tab in tabs" :key="item" style="text-transform: uppercase">
							{{ tab }}
						</v-tab>
					</v-tabs>

					<v-tabs-items v-model="selectedTab" class="info-table">
						<v-tab-item v-for="tab in tabs" :key="item">
							<!-- use template for vertical layout -->
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
										/>
									</div>
								</template>
							</template>
							<!-- use div for horizontal layout -->
							<div v-if="tab === tabs.authors" class="double_table">
								<template v-for="category in authorCategories">
									<div style="padding: 15px">
										<h2 style="text-transform: capitalize">{{ category }}</h2>
										<v-data-table
											dense
											:headers="getHeaders(category)"
											:items="getItems(category)"
											class="elevation-1"
											style="margin-top: 10px"
											hide-default-footer
										/>
									</div>
								</template>
							</div>
						</v-tab-item>
					</v-tabs-items>
				</div>
			</div>
		</v-card>
	</v-dialog>
</template>

<script>
import moment from "moment";

import GalleryImage from "./gallery-image.vue";

export default {
	name: "gallery-modal",
	components: {
		GalleryImage,
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
		onClose: {
			type: Function,
			default: () => {},
		},
	},
	data() {
		return {
			selectedTab: null,
			tabs: this.$root.lang().gallery.modal.tabs,
			textureCategories: ["texture", "uses", "paths"],
			authorCategories: ["32x", "64x"], // TODO: switch for pack modal
			opened: false,
		};
	},
	watch: {
		value: {
			handler(n) {
				this.opened = n;
			},
			immediate: true,
		},
		opened(n) {
			this.$emit("input", n);
		},
	},
	methods: {
		closeModal() {
			this.onClose();
			this.opened = false;
		},
		discordIDtoName(d) {
			return this.contributors[d]
				? this.contributors[d].username
					? this.contributors[d].username
					: this.$root.lang().gallery.error_message.user_anonymous
				: this.$root.lang().gallery.error_message.user_not_found;
		},
		timestampToDate(t) {
			return moment(new Date(t)).format("ll");
		},
		getItems(item) {
			switch (item) {
				case this.authorCategories[0]:
				case this.authorCategories[1]:
					return this.textureObj.contributions
						.filter((el) => el.resolution === parseInt(item, 10))
						.sort((a, b) => b.date - a.date)
						.map((el) => ({
							date: this.timestampToDate(el.date),
							pack: this.packToName[el.pack],
							contributors: el.authors.map((el) => this.discordIDtoName(el)).join(",\n"),
						}));
				case this.textureCategories[0]:
					return [
						{
							...this.textureObj[item],
							tags: this.textureObj[item].tags.join(", "),
						},
					];
				case this.textureCategories[1]:
					return Object.values(this.textureObj[item]);

				case this.textureCategories[2]:
					return this.textureObj[item].map((path) => ({
						...path,
						versions: path.versions.join(", "),
					}));
			}
		},
		getHeaders(item) {
			switch (item) {
				case this.authorCategories[0]:
				case this.authorCategories[1]:
					return [
						{
							text: this.$root.lang().gallery.modal.data.date,
							value: "date",
						},
						{
							text: this.$root.lang().gallery.modal.data.pack,
							value: "pack",
						},
						{
							text: this.$root.lang().gallery.modal.data.authors,
							value: "contributors",
						},
					];
				case this.textureCategories[0]:
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
				case this.textureCategories[1]:
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
							text: this.$root.lang().gallery.modal.data.editions,
							value: "edition",
						},
						{
							text: this.$root.lang().gallery.modal.data.texture_id,
							value: "texture",
						},
					];

				case this.textureCategories[2]:
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
		grouped() {
			const result = [];
			if (this.textureObj) {
				Object.entries(this.textureObj.urls).forEach((urlArr, i) => {
					if (i % 2 === 0) result.push([]);
					result[result.length - 1].push({ name: urlArr[0], image: urlArr[1] });
				});
			}

			return result;
		},
	},
};
</script>
