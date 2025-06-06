<template>
	<v-list rounded two-line class="main-container">
		<v-row>
			<v-col v-for="(results, index) in splitResults" :key="index" :cols="12 / listColumns" xs="1">
				<v-list-item v-for="res in results" :key="res[track]">
					<slot :item="res" />
				</v-list-item>
			</v-col>
		</v-row>

		<v-btn
			v-if="displayedResults < items.length"
			:style="{ margin: 'auto', 'min-width': '250px !important' }"
			:color="pageColor"
			:class="[textColor, 'my-2']"
			block
			@click="showMore"
		>
			{{ $root.lang().global.btn.load_more }}
		</v-btn>
	</v-list>
</template>

<script>
const MIN_DISPLAYED_RESULTS = 150;
const RESULT_INCREMENT = 100;

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
		listColumns() {
			let columns = 1;

			if (this.$vuetify.breakpoint.mdAndUp && this.displayedResults >= 6) {
				columns = 2;
				if (this.$vuetify.breakpoint.lgAndUp && this.displayedResults >= 21) {
					columns = 3;
				}
			}

			if (this.items.length === 1) columns = 1;

			// for pack page where only two columns allowed
			if (columns > this.maxColumns) columns = this.maxColumns;

			return columns;
		},
		splitResults() {
			const res = [];

			const len = this.items.length;

			for (let col = 0; col < this.listColumns; ++col) res.push([]);

			let arrayIndex = 0;

			for (let i = 0; i < Math.min(this.displayedResults, len); ++i) {
				res[arrayIndex].push(this.items[i]);
				arrayIndex = (arrayIndex + 1) % this.listColumns;
			}

			return res;
		},
	},
};
</script>
