<template>
	<v-list class="main-container pa-2" two-line>
		<div class="text-center">
			<template v-if="loading">
				<div class="text-h6 ma-1">{{ $root.lang().gallery.loading_message }}</div>
				<v-progress-circular class="ma-1" v-if="loading" indeterminate />
			</template>
			<div v-else-if="textures.length === 0" class="text-h6 my-2">
				{{ error || $root.lang().global.no_results }}
			</div>
		</div>
		<div class="gallery-textures-container mx-auto" :style="styles.grid">
			<!-- sort method in key ensures rerenders change the image (this took me an hour) -->
			<div
				v-for="(texture, index) in sortedTextures"
				v-if="index <= max"
				:key="sort + texture.textureID"
				:style="styles.cell"
				class="gallery-texture-in-container"
				@click.stop="$emit('changeShareURL', texture.textureID)"
			>
				<tippy :to="texture.id" placement="right-start" theme="" maxWidth="350px">
					<template #trigger>
						<gallery-image
							:src="texture.url"
							:textureID="texture.textureID"
							:ignoreList="ignoreList"
						>
							<h1 :style="styles.not_done.texture_id">#{{ texture.textureID }}</h1>
							<h3 :style="styles.not_done.texture_name">{{ texture.name }}</h3>
							<p :style="styles.not_done.message">
								{{ $root.lang().gallery.error_message.texture_not_done }}
							</p>
						</gallery-image>
						<v-btn
							@click.stop="$emit('changeShareURL', texture.textureID)"
							class="ma-2 gallery-share"
							absolute
							plain
							icon
						>
							<v-icon>mdi-share-variant</v-icon>
						</v-btn>
					</template>

					<gallery-tooltip
						:mojang="isMojang(pack)"
						:texture="texture"
						:contributions="loadedContributions"
						:pack="pack"
						:discordIDtoName="discordIDtoName"
					/>
				</tippy>
			</div>
		</div>
	</v-list>
</template>

<script>
import axios from "axios";

import GalleryTooltip from "./gallery-tooltip.vue";
import GalleryImage from "./gallery-image.vue";

export default {
	name: "gallery-grid",
	components: {
		GalleryTooltip,
		GalleryImage,
	},
	props: {
		loading: {
			type: Boolean,
			required: true,
		},
		styles: {
			type: Object,
			required: true,
		},
		textures: {
			type: Array,
			required: true,
		},
		pack: {
			type: String,
			required: true,
		},
		max: {
			type: Number,
			required: true,
		},
		ignoreList: {
			type: Array,
			required: false,
			default: () => [],
		},
		discordIDtoName: {
			type: Function,
			required: true,
		},
		sort: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			loadedContributions: {},
			lastContributions: {},
		};
	},
	methods: {
		isMojang(packID) {
			return ["default", "progart"].includes(packID);
		},
		getLastContributions(pack) {
			if (this.isMojang(this.pack)) return this.loadedContributions;
			return Object.entries(this.loadedContributions[pack])
				.map(([key, contrib]) => {
					return [key, contrib.sort((a, b) => b.date - a.date)?.[0]];
				})
				.reduce((acc, [k, cur]) => {
					acc[k] = cur;
					return acc;
				}, {});
		}
	},
	computed: {
		sortedTextures() {
			return Array.from(this.textures).sort(this.sortMethods[this.sort]);
		},
		sortMethods() {
			// needs to be computed because we're using outer data for a closure
			return {
				nameDesc: (a, b) => b.name.localeCompare(a.name),
				nameAsc: (a, b) => a.name.localeCompare(b.name),
				idDesc: (a, b) => Number(b.textureID) - Number(a.textureID),
				idAsc: (a, b) => Number(a.textureID) - Number(b.textureID),
				contribDesc: (a, b) => {
					if (!this.lastContributions) return 0;
					// later date wins (if the pack has no contributions put them at end)
					const aContrib = this.lastContributions[a.textureID]?.date || 0;
					const bContrib = this.lastContributions[b.textureID]?.date || 0;
					return bContrib - aContrib;
				},
			};
		},
	},
	watch: {
		pack(n, o) {
			if (n === o || !Object.keys(this.loadedContributions)) return;
			this.lastContributions = this.getLastContributions(n);
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/contributions/raw`).then((res) => {
			this.loadedContributions = Object.values(res.data)
				.filter((contribution) => contribution.pack && contribution.texture)
				.reduce((acc, cur) => {
					if (!acc[cur.pack]) acc[cur.pack] = {};
					if (!acc[cur.pack][cur.texture]) acc[cur.pack][cur.texture] = [];

					acc[cur.pack][cur.texture].push({
						authors: cur.authors,
						date: cur.date,
					});

					return acc;
				}, {});
			this.lastContributions = this.getLastContributions(this.pack);
		});
	},
};
</script>
