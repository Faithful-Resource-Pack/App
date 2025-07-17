<template>
	<v-list rounded two-line class="main-container">
		<v-row>
			<v-col v-for="item in results" :key="item[track]" :cols="12 / columnCount" xs="1">
				<v-list-item>
					<slot :item="item" />
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
		},
	},
	computed: {
		results() {
			return this.items.slice(0, this.displayedResults);
		},
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
		loadMoreStyle() {
			const width = this.$vuetify.breakpoint.xs ? 100 : 50;
			return {
				"min-width": `${width}% !important`,
			};
		},
	},
};
</script>
