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
		<div class="gallery-textures-container mx-auto" :style="gridStyles">
			<!-- sort method in key ensures rerenders change the image (this took me an hour) -->
			<div
				v-for="(texture, index) in sortedTextures"
				v-if="index <= displayedResults"
				:key="sort + texture.textureID"
				class="gallery-texture-in-container"
				@click.exact.stop="$emit('open', texture.textureID)"
				@click.middle.stop="$emit('openNewTab', texture.textureID)"
				@click.meta.stop="$emit('openNewTab', texture.textureID)"
			>
				<tippy-component :to="texture.id" placement="right-start" theme="" maxWidth="350px">
					<template #trigger>
						<gallery-image
							:src="texture.url"
							:textureID="texture.textureID"
							:ignoreList="ignoreList"
						>
							<h1 :style="missingTextStyles.texture_id">#{{ texture.textureID }}</h1>
							<h3 :style="missingTextStyles.texture_name">{{ texture.name }}</h3>
							<p :style="missingTextStyles.message">
								{{ $root.lang().gallery.error_message.texture_not_done }}
							</p>
						</gallery-image>
						<v-btn
							@click.stop="$emit('share', texture.textureID)"
							class="ma-2 gallery-share"
							absolute
							plain
							icon
						>
							<v-icon>mdi-share-variant</v-icon>
						</v-btn>
					</template>

					<gallery-tooltip
						:mojang="isMojang"
						:texture="texture"
						:contributions="loadedContributions"
						:pack="pack"
						:discordIDtoName="discordIDtoName"
						:ignoreList="ignoreList"
					/>
				</tippy-component>
			</div>
		</div>

		<v-btn icon large @click="toTop" v-show="scrollY > 300" class="go-up-btn">
			<v-icon>mdi-arrow-up</v-icon>
		</v-btn>

		<div ref="bottomElement" />
	</v-list>
</template>

<script>
import axios from "axios";

import GalleryTooltip from "./gallery-tooltip.vue";
import GalleryImage from "./gallery-image.vue";
import { TippyComponent } from "vue-tippy";

const MIN_ROW_DISPLAYED = 5;

export default {
	name: "gallery-grid",
	components: {
		GalleryTooltip,
		GalleryImage,
		TippyComponent,
	},
	props: {
		value: {
			type: Number,
			required: true,
		},
		loading: {
			type: Boolean,
			required: true,
		},
		stretched: {
			type: Boolean,
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
		error: {
			type: String,
			required: false,
		},
	},
	data() {
		return {
			loadedContributions: {},
			lastContributions: {},
			columns: 7,
			// number of displayed results
			displayedResults: 1,
			// go to the top arrow
			scrollY: 0,
		};
	},
	methods: {
		toTop() {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
			// prevents page becoming really slow from too many displayed results after going up
			this.displayedResults = this.pageLength;
		},
		getLastContributions(pack) {
			if (this.isMojang) return this.loadedContributions;

			// faster than map and fromEntries
			const acc = {};
			for (const [key, contrib] of Object.entries(this.loadedContributions[pack])) {
				acc[key] = contrib.sort((a, b) => b.date - a.date)?.[0];
			}

			return acc;
		},
		isScrolledIntoView(el, margin = 0) {
			const rect = el.getBoundingClientRect();
			const elemTop = rect.top;
			const elemBottom = rect.bottom;
			return elemTop < window.innerHeight + margin && elemBottom >= 0;
		},
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
		maxColumns() {
			const { xs, sm, md, lg, xl } = this.$vuetify.breakpoint;

			// completely arbitrary values, feel free to change these
			// based on https://v2.vuetifyjs.com/en/features/breakpoints/
			if (xs) return 1;
			if (sm) return 4;
			if (md) return 8;
			if (lg) return 12;
			if (xl) return 16;
		},
		shownColumns() {
			return Math.min(this.columns, this.maxColumns);
		},
		// how much to increment shown results by when scrolling
		pageLength() {
			return this.shownColumns * MIN_ROW_DISPLAYED;
		},
		gridStyles() {
			// bigger images -> smaller gaps
			const gap = this.$vuetify.breakpoint.mobile ? 8 : Math.round(100 / this.shownColumns);

			return {
				gap: `${gap}px`,
				gridTemplateColumns: `repeat(${this.shownColumns}, 1fr)`,
			};
		},
		missingTextStyles() {
			const CONTAINER_PADDING = 20; // .container padding (12px) + .v-list.main-container padding (8px)

			// double padding for each side
			const gridWidth = this.$el.clientWidth - CONTAINER_PADDING * 2;
			const imgWidth = gridWidth / this.shownColumns;

			// arbitrary scaling factor, seems to look pretty good
			const fontSize = imgWidth / 20;

			return {
				texture_id: { fontSize: `${fontSize * 4}px` },
				texture_name: { fontSize: `${fontSize * 2}px` },
				message: { fontSize: `${fontSize * 1.2}px` },
			};
		},
	},
	watch: {
		pack(n, o) {
			if (n === o || !Object.keys(this.loadedContributions).length) return;
			this.lastContributions = this.getLastContributions(n);
		},
		value: {
			handler(newValue) {
				this.columns = newValue;
			},
			// load from localStorage as soon as possible
			immediate: true,
		},
		columns(n) {
			this.$emit("input", n);
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

		this.displayedResults = this.pageLength;
	},
	mounted() {
		const el = this.$refs.bottomElement;
		document.addEventListener("scroll", () => {
			this.scrollY = document.firstElementChild.scrollTop;

			if (!el || !this.isScrolledIntoView(el, 600)) return;

			// add more results when near bottom
			this.displayedResults += this.pageLength;
		});
	},
};
</script>
