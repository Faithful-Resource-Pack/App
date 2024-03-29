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
			<template v-if="Object.keys(textureObj).length > 0">
				<div class="gallery-dialog-container d-sm-flex flex-column flex-sm-row pa-2 pa-sm-7">
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
											:src="url[1]"
											:textureID="textureID"
											:ignoreList="ignoreList"
										>
											<p>{{ $root.lang().gallery.error_message.texture_not_done }}</p>
										</gallery-image>
										<h2>{{ packToName[url[0]] }}</h2>
									</div>
								</template>
							</div>
						</template>
					</div>

					<div class="pl-sm-7">
						<v-tabs id="info-tabs" v-model="tab" :show-arrows="false">
							<v-tabs-slider />

							<v-tab v-for="item in items" :key="item" style="text-transform: uppercase">
								{{ item }}
							</v-tab>
						</v-tabs>

						<v-tabs-items v-model="tab" class="info-table">
							<v-tab-item v-for="item in items" :key="item">
								<template v-if="item === items[0]">
									<template v-for="i in info">
										<div class="gallery-info">
											<h2>{{ $root.lang().gallery.modal.info[i] }}</h2>
											<v-data-table
												dense
												:headers="getHeaders(i)"
												:items="getItems(i)"
												class="elevation-1"
												style="margin-top: 10px"
												hide-default-footer
											/>
										</div>
									</template>
								</template>
								<div v-if="item === items[1]" class="double_table">
									<template v-for="i in authors">
										<div style="padding: 15px">
											<h2 style="text-transform: capitalize">{{ i }}</h2>
											<v-data-table
												dense
												:headers="getHeaders(i)"
												:items="getItems(i)"
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
			</template>
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
			tab: null,
			items: [
				this.$root.lang().gallery.modal.items.information,
				this.$root.lang().gallery.modal.items.authors,
			],
			info: ["texture", "uses", "paths"],
			authors: ["32x", "64x"],
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
			let output = [];

			switch (item) {
				case this.authors[0]:
				case this.authors[1]:
					return this.textureObj.contributions
						.filter((el) => el.resolution === parseInt(item, 10))
						.sort((a, b) => b.date - a.date)
						.map((el) => ({
							date: this.timestampToDate(el.date),
							pack: this.packToName[el.pack],
							contributors: el.authors.map((el) => this.discordIDtoName(el)).join(",\n"),
						}));
				case this.info[0]:
					return [
						{
							...this.textureObj[item],
							tags: this.textureObj[item].tags.join(", "),
						},
					];
				case this.info[1]:
					return Object.values(this.textureObj[item]);

				case this.info[2]:
					this.textureObj[item].forEach((path) => {
						output.push({
							...path,
							versions: path.versions.join(", "),
						});
					});

					return output;
			}
		},
		getHeaders(item) {
			switch (item) {
				case this.authors[0]:
				case this.authors[1]:
					return [
						{
							text: this.$root.lang().gallery.modal.tabs.date,
							value: "date",
						},
						{
							text: this.$root.lang("gallery.modal.tabs.pack"),
							value: "pack",
						},
						{
							text: this.$root.lang().gallery.modal.tabs.authors,
							value: "contributors",
						},
					];
				case this.info[0]:
					return [
						{
							text: this.$root.lang().gallery.modal.tabs.id,
							value: "id",
							sortable: false,
						},
						{
							text: this.$root.lang().gallery.modal.tabs.name,
							value: "name",
							sortable: false,
						},
						{
							text: this.$root.lang().gallery.modal.tabs.tags,
							value: "tags",
							sortable: false,
						},
					];
				case this.info[1]:
					return [
						{
							text: this.$root.lang().gallery.modal.tabs.use_id,
							value: "id",
						},
						{
							text: this.$root.lang().gallery.modal.tabs.use_name,
							value: "name",
						},
						{
							text: this.$root.lang().gallery.modal.tabs.editions,
							value: "edition",
						},
						{
							text: this.$root.lang().gallery.modal.tabs.texture_id,
							value: "texture",
						},
					];

				case this.info[2]:
					return [
						{
							text: this.$root.lang().gallery.modal.tabs.path_id,
							value: "id",
						},
						{
							text: this.$root.lang().gallery.modal.tabs.resource_pack_path,
							value: "name",
						},
						{
							text: this.$root.lang().gallery.modal.tabs.mc_versions,
							value: "versions",
						},
						{
							text: this.$root.lang().gallery.modal.tabs.use_id,
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
					result[result.length - 1].push(urlArr);
				});
			}

			return result;
		},
	},
};
</script>
