<template>
	<v-list rounded two-line class="main-container">
		<v-row>
			<v-col v-for="(results, index) in splitResults" :key="index" :cols="12 / columnCount" xs="1">
				<v-list-item v-for="res in results" :key="res[track]">
					<slot :item="res" />
				</v-list-item>
			</v-col>
		</v-row>

		<v-btn
			v-if="displayedResults < items.length"
			class="my-2 mx-auto"
			:color="pageColor"
			:class="textColor"
			:style="loadMoreStyle"
			block
			@click="showMore"
		>
			{{ $root.lang().global.btn.load_more }}
			<v-icon right>mdi-plus</v-icon>
		</v-btn>
	</v-list>
</template>

<script>
const MIN_DISPLAYED_RESULTS = 120;
const RESULT_INCREMENT = 120;

// lazy loaded list which automatically paginates and fits list to screen
export default {
	name: "smart-grid",
	props: {
		items: {
			type: Array,
			required: true,
		},
		pageColor: {
			type: String,
			required: false,
			default: "primary",
		},
		textColor: {
			type: String,
			required: false,
			default: "",
		},
		track: {
			type: String,
			required: false,
			default: "id",
		},
		maxColumns: {
			type: Number,
			required: false,
			default: 3,
		},
	},
	data() {
		return {
			displayedResults: MIN_DISPLAYED_RESULTS,
		};
	},
	methods: {
		showMore() {
			this.displayedResults += RESULT_INCREMENT;
			this.$emit("showMore", false);
		},
	},
	computed: {
		columnCount() {
			let columns = 1;

			if (this.$vuetify.breakpoint.mdAndUp && this.displayedResults >= 6) {
				columns = 2;
				if (this.$vuetify.breakpoint.lgAndUp && this.displayedResults >= 21) {
					columns = 3;
				}
			}

			if (this.items.length === 1) columns = 1;
			return Math.min(columns, this.maxColumns);
		},
		splitResults() {
			const res = [];

			const len = this.items.length;

			for (let col = 0; col < this.columnCount; ++col) res.push([]);

			let arrayIndex = 0;

			for (let i = 0; i < Math.min(this.displayedResults, len); ++i) {
				res[arrayIndex].push(this.items[i]);
				arrayIndex = (arrayIndex + 1) % this.columnCount;
			}

			return res;
		},
		loadMoreStyle() {
			const width = this.$vuetify.breakpoint.xs ? 100 : 50;
			return {
				"min-width": `${width}% !important`,
			};
		},
	},
};
</script>
