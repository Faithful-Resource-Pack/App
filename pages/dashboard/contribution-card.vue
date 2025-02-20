<template>
	<dashboard-card
		id="contribution-card"
		:title="$root.lang().dashboard.titles.contribution_activity"
		to="/contributions"
		:clickable="$root.isAdmin"
		class="d-flex flex-column"
	>
		<v-card-text class="pb-3 flex-grow-1 d-flex align-stretch">
			<v-row class="mb-0" v-if="data" style="width: 100%">
				<v-col
					cols="12"
					sm="6"
					class="pr-sm-2 d-flex flex-column justify-space-around pb-0"
					v-for="(values, activity) in data.activity"
					:key="activity"
				>
					<div class="title text-button text--secondary">
						{{ packToName[activity] }}
					</div>
					<div class="heatmap-wrapper">
						<calendar-heatmap
							:values="values"
							:end-date="today"
							:max="data.percentiles[activity]"
							:tooltip-unit="$root.lang().dashboard.totals.contributions"
							:locale="locale"
							:range-color="colors"
						/>
					</div>
				</v-col>
			</v-row>
			<v-row class="mb-0" v-else style="width: 100%">
				<v-col
					cols="12"
					sm="6"
					class="pr-sm-2 d-flex flex-column justify-space-around pb-0"
					v-for="i in 5"
					:key="`skeleton-${i}`"
				>
					<v-skeleton-loader height="24" type="heading" class="mb-2" />
					<v-skeleton-loader height="130" type="card" />
				</v-col>
			</v-row>
		</v-card-text>
	</dashboard-card>
</template>

<script>
import axios from "axios";
import moment from "moment";

import DashboardCard from "./dashboard-card.vue";

export default {
	name: "contribution-card",
	components: {
		DashboardCard,
	},
	props: {
		colors: {
			required: true,
			type: Array,
		},
	},
	data() {
		return {
			data: undefined,
			packToName: {},
		};
	},
	computed: {
		totals() {
			if (!this.data) return [, , ,];
			return Object.keys(this.data)
				.filter((e) => e.includes("total"))
				.map((e) => {
					return {
						name: e.replace("total_", ""),
						value: this.data[e],
					};
				});
		},
		today() {
			return new Date();
		},
		locale() {
			return {
				months: moment.monthsShort().map((e) => e[0].toUpperCase() + e.slice(1)),
				days: moment.weekdaysShort().map((e) => e[0].toUpperCase() + e.slice(1)),
				...this.$root.lang().dashboard.locale,
			};
		},
	},
	created() {
		axios.get(`${this.$root.apiURL}/contributions/stats`, this.$root.apiOptions).then((res) => {
			this.data = res.data;
		});
		axios.get(`${this.$root.apiURL}/packs/raw`).then((res) => {
			this.packToName = Object.values(res.data).reduce((acc, cur) => {
				acc[cur.id] = cur.name;
				return acc;
			}, {});
		});
	},
	watch: {
		totals(n, o) {
			if (!o) return; // o is undefined
			if (!o.length) return; // o is empty

			// run
			this.$emit("stats", n);
		},
	},
};
</script>
