<template>
	<infinite-scroller class="gallery-textures-container mx-auto" :style="gridStyles" @more="showMore">
		<div
			v-for="item in displayedItems"
			:key="itemKey(item)"
			class="gallery-texture-in-container"
			@click.exact.stop="$emit('click', item)"
			@click.exact.middle.stop="$emit('clickNewTab', item)"
			@click.exact.meta.stop="$emit('clickNewTab', item)"
		>
			<tippy-component :to="tooltipTarget(item)" placement="right-start" maxWidth="350px">
				<template #trigger>
					<slot name="item" :item="item" :missingTextStyles="missingTextStyles" />
				</template>

				<slot name="tooltip" :item="item" />
			</tippy-component>
		</div>

		<v-btn
			v-show="scrollY > 500"
			fab
			class="go-up-btn"
			:title="$root.lang().gallery.to_top"
			@click="toTop"
		>
			<v-icon large>mdi-chevron-up</v-icon>
		</v-btn>
	</infinite-scroller>
</template>

<script>
import { TippyComponent } from "vue-tippy";
import InfiniteScroller from "@layouts/infinite-scroller.vue";

// how many rows to add on scroll
const ROW_INCREMENT = 5;

/**
 * Grid of square tiles with infinite scrolling, shared by the gallery pages.
 * The `item` slot is the tile, the `tooltip` slot is shown when hovering it.
 */
export default {
	name: "texture-grid",
	components: { InfiniteScroller, TippyComponent },
	props: {
		items: {
			type: Array,
			required: true,
		},
		// unique key of an item, should change when its tile needs a rerender
		itemKey: {
			type: Function,
			required: true,
		},
		columns: {
			type: Number,
			required: true,
		},
		// tippy target of an item (omit unless the tooltip must be bound to a named element)
		tooltipTarget: {
			type: Function,
			required: false,
			default: () => undefined,
		},
	},
	emits: ["click", "clickNewTab"],
	data() {
		return {
			width: 0,
			// number of displayed items
			displayedResults: 1,
			// go to the top arrow
			scrollY: 0,
			// must maintain static references to listeners for unmounting
			resizeListener: () => {},
			scrollListener: () => {},
		};
	},
	computed: {
		displayedItems() {
			return this.items.slice(0, this.displayedResults);
		},
		// how much to increment shown results by when scrolling
		pageLength() {
			return this.columns * ROW_INCREMENT;
		},
		gridStyles() {
			// bigger images -> smaller gaps
			const gap = this.$vuetify.breakpoint.mobile ? 8 : Math.round(100 / this.columns);

			return {
				gap: `${gap}px`,
				// minmax(0, ...) so long texture names in placeholders can never widen a column
				gridTemplateColumns: `repeat(${this.columns}, minmax(0, 1fr))`,
			};
		},
		// font sizes of the "texture not done" placeholder, scaled to the tile size
		missingTextStyles() {
			// .container padding (12px) + v-card .pa-2 padding (8px)
			const CONTAINER_PADDING = 20;

			// double padding for each side
			const gridWidth = this.width - CONTAINER_PADDING * 2;
			const imgWidth = gridWidth / this.columns;

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
		// a new list starts back from the first rows
		items() {
			this.displayedResults = this.pageLength * 3;
		},
	},
	methods: {
		toTop() {
			document.getElementById("main").scrollTo({
				top: 0,
				behavior: "smooth",
			});
			// prevents page becoming really slow from too many displayed results after going up
			this.displayedResults = this.pageLength;
		},
		showMore() {
			this.displayedResults += this.pageLength;
		},
	},
	created() {
		// start off with more results
		this.displayedResults = this.pageLength * 3;
	},
	mounted() {
		// initialize callback references (they need to be the same for unmounting)
		this.resizeListener = () => {
			this.width = this.$el.clientWidth;
		};
		this.scrollListener = () => {
			this.scrollY = document.getElementById("main").scrollTop;
		};

		window.addEventListener("resize", this.resizeListener);
		document.getElementById("main")?.addEventListener("scroll", this.scrollListener);
		this.resizeListener();
	},
	destroyed() {
		window.removeEventListener("resize", this.resizeListener);
		document.getElementById("main")?.removeEventListener("scroll", this.scrollListener);
	},
};
</script>

<style lang="scss">
.gallery-textures-container {
	display: grid;
}

.gallery-texture-in-container {
	text-align: center;
	position: relative;
	background-size: cover;
	background-position: center;
	aspect-ratio: 1 !important;
}

.theme--dark .gallery-texture-in-container {
	background-size: cover !important;
	background: url(/resources/transparency.png);
}

.go-up-btn {
	position: fixed;
	bottom: 64px;
	right: 64px;
	z-index: 202;
}
</style>
