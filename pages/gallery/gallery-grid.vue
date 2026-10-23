<template>
	<texture-grid
		:items="sortedTextures"
		:itemKey="(texture) => sort + texture.textureID"
		:columns="shownColumns"
		:tooltipTarget="(texture) => texture.id"
		@click="(texture) => $emit('open', texture.textureID)"
		@clickNewTab="(texture) => $emit('openNewTab', texture.textureID)"
	>
		<template #item="{ item: texture, missingTextStyles }">
			<gallery-image
				:src="texture.url"
				:alt="texture.name"
				:textureID="texture.textureID"
				:ignoreList="ignoreList"
				:animated="animated"
				:animatedTextures="animatedTextures"
			>
				<h1 :style="missingTextStyles.texture_id">#{{ texture.textureID }}</h1>
				<h3 :style="missingTextStyles.texture_name">{{ texture.name }}</h3>
				<p :style="missingTextStyles.message">
					{{ $root.lang().gallery.error_message.texture_not_done }}
				</p>
			</gallery-image>
			<v-btn
				class="ma-2 gallery-share"
				absolute
				plain
				icon
				:title="$root.lang().gallery.share"
				@click.stop="$emit('share', texture.textureID)"
			>
				<v-icon>mdi-share-variant</v-icon>
			</v-btn>
		</template>

		<template #tooltip="{ item: texture }">
			<gallery-tooltip
				:texture="texture"
				:mojang="isMojang"
				:contributions="lastContributions"
				:discordIDtoName="discordIDtoName"
				:ignoreList="ignoreList"
			/>
		</template>
	</texture-grid>
</template>

<script>
import axios from "axios";

import TextureGrid from "@components/texture-grid.vue";
import GalleryTooltip from "./gallery-tooltip.vue";
import GalleryImage from "./gallery-image.vue";

export default {
	name: "gallery-grid",
	components: {
		TextureGrid,
		GalleryTooltip,
		GalleryImage,
	},
	props: {
		textures: {
			type: Array,
			required: true,
		},
		pack: {
			type: String,
			required: true,
		},
		animated: {
			type: Boolean,
			required: true,
		},
		sort: {
			type: String,
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
		shownColumns: {
			type: Number,
			required: true,
		},
	},
	emits: ["open", "openNewTab", "share"],
	data() {
		return {
			loadedContributions: {},
			// list of animated textures ids
			animatedTextures: [],
		};
	},
	computed: {
		isMojang() {
			return ["default", "progart"].includes(this.pack);
		},
		sortedTextures() {
			return Array.from(this.textures).sort(this.sortMethods[this.sort]);
		},
		sortMethods() {
			// needs to be computed because we're using outer data for a closure
			const methods = {
				nameDesc: (a, b) => b.name.localeCompare(a.name),
				nameAsc: (a, b) => a.name.localeCompare(b.name),
				idDesc: (a, b) => Number(b.textureID) - Number(a.textureID),
				idAsc: (a, b) => Number(a.textureID) - Number(b.textureID),
				contribDesc: (a, b) => {
					if (!this.lastContributions) return methods.nameAsc(a, b);
					// later date wins (if the pack has no contributions put them at end)
					const aContrib = this.lastContributions[a.textureID]?.date || 0;
					const bContrib = this.lastContributions[b.textureID]?.date || 0;
					return bContrib - aContrib;
				},
			};
			return methods;
		},
		lastContributions() {
			if (this.isMojang) return undefined;
			return this.loadedContributions[this.pack];
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/textures/animated`).then((res) => {
			this.animatedTextures = res.data.map((el) => el.toString());
		});

		axios.get(`${this.$root.apiURL}/contributions/raw`).then((res) => {
			this.loadedContributions = Object.values(res.data).reduce((acc, cur) => {
				if (!cur.date)
					console.error(`Contribution ${cur.id} ([#${cur.texture}] for ${cur.pack}) has no date!`);
				acc[cur.pack] ||= {};
				const existing = acc[cur.pack][cur.texture];

				// newer date wins
				if (existing === undefined || existing?.date < cur.date) acc[cur.pack][cur.texture] = cur;

				return acc;
			}, {});
		});
	},
};
</script>

<style lang="scss">
.gallery-texture-in-container .gallery-share {
	top: 0;
	right: 0;
	opacity: 0;
	transition: all 0.25s ease;
}

.gallery-texture-in-container:hover .gallery-share {
	opacity: 1;
}
</style>
