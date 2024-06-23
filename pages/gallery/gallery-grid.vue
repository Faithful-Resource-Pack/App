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
				v-if="index <= displayedResults"
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
		<div class="bottomElement" />
	</v-list>
</template>

<script>
import axios from "axios";

import GalleryTooltip from "./gallery-tooltip.vue";
import GalleryImage from "./gallery-image.vue";

const MIN_ROW_DISPLAYED = 5;

export default {
	name: "gallery-grid",
	components: {
		GalleryTooltip,
		GalleryImage,
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
	},
	data() {
		return {
			loadedContributions: {},
			lastContributions: {},
			columns: 7,
			// number of displayed results
			displayedResults: 1,
			// styles
			styles: {
				// gallery cell styles
				cell: { "aspect-ratio": "1" },
				// grid styles
				grid: undefined,
				// placeholder font size styles
				not_done: {
					texture_id: "font-size: 2em;",
					texture_name: "font-size: 1.17em;",
					message: "font-size: 16px",
				},
			},
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
		},
		isScrolledIntoView(el, margin = 0) {
			const rect = el.getBoundingClientRect();
			const elemTop = rect.top;
			const elemBottom = rect.bottom;
			return elemTop < window.innerHeight + margin && elemBottom >= 0;
		},
		computeGrid() {
			const breakpoints = this.$root.$vuetify.breakpoint;
			let gap;
			let number;

			let baseColumns = this.columns;
			if (breakpoints.smAndDown) baseColumns = breakpoints.smOnly ? 2 : 1;

			// constants
			const MIN_WIDTH = 110;
			const MARGIN = 20; // .container padding (12px) + .v-list.main-container padding (8px)

			// real content width
			const width = this.$el.clientWidth - MARGIN * 2;

			if (baseColumns != 1) {
				// * We want to solve n * MIN_WIDTH + (n - 1) * A = width
				// * where A = 200 / (1.5 * n)
				// * => n * MIN_WIDTH + ((n*200)/(1.5*n)) - 1*200/(1.5*n) = width
				// * => n * MIN_WIDTH + 200/1.5 - 200/(1.5*n) = width
				// * multiply by n
				// * => n² * MIN_WIDTH + 200n/1.5 - 200/1.5 = width*n
				// * => n² * MIN_WITH + n * (200/1.5 - width) - 200/1.5 = 0
				// * solve that and keep positive value
				const a = MIN_WIDTH;
				const b = 200 / 1.5 - width;
				const c = -200 / 1.5;
				const delta = b * b - 4 * a * c;
				const n = (-b + Math.sqrt(delta)) / (2 * a);
				gap = 200 / (n * 1.5);
				number = Math.min(baseColumns, Math.floor(n));
			} else {
				gap = 8;
				number = 1;
			}

			const fontSize = width / number / 20;

			this.styles.not_done = {
				texture_id: { "font-size": `${fontSize * 4}px` },
				texture_name: { "font-size": `${fontSize * 2}px` },
				message: { "font-size": `${fontSize * 1.2}px` },
			};

			this.styles.grid = {
				gap: `${gap}px`,
				"grid-template-columns": `repeat(${number}, 1fr)`,
			};
		},
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
		value(newValue) {
			this.columns = newValue;
		},
		columns(n) {
			this.computeGrid();
			this.$emit("input", n);
		},
		stretched() {
			this.$nextTick(() => this.computeGrid());
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

		this.displayedResults = this.columns * MIN_ROW_DISPLAYED;
	},
	mounted() {
		document.addEventListener("scroll", () => {
			this.scrollY = document.firstElementChild.scrollTop;
			const scrolledTo = document.querySelector(".bottomElement");

			if (scrolledTo && this.isScrolledIntoView(scrolledTo, 600)) {
				this.displayedResults += this.columns * MIN_ROW_DISPLAYED;
				this.$forceUpdate();
			}
		});
		window.addEventListener("resize", () => void this.computeGrid());
		this.computeGrid();
	},
};
</script>
