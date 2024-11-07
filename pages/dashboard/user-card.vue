<template>
	<dashboard-card
		:title="$root.lang('dashboard.titles.users')"
		to="/users"
		:clickable="$root.isAdmin"
	>
		<v-card-text class="pb-3">
			<v-row class="py-0 my-0" v-if="data" dense>
				<v-col v-for="info in ['total_anonymous', 'total_roles']" :key="info" cols="12" sm="6">
					<p v-if="data[info] !== undefined" class="mb-0 rounded-lg pa-3">
						<span class="v-card__title pa-0 d-inline text--primary">{{ data[info] || 0 }}</span>
						{{ $root.lang(`dashboard.users.${info}`) }}
					</p>
				</v-col>
			</v-row>
			<v-row class="py-0 my-0" v-else dense>
				<v-col v-for="i in 2" :key="`user-stats-${i}`" cols="12" sm="6">
					<div style="min-height: 56px" class="p mb-0 rounded-lg pa-3 d-flex align-center">
						<v-skeleton-loader height="24" type="heading" width="100%" />
					</div>
				</v-col>
			</v-row>
			<roles-graph
				:loading="data === undefined"
				:series="series"
				:labels="labels"
				:colors="colors"
			/>
		</v-card-text>
	</dashboard-card>
</template>

<script>
import axios from "axios";

import DashboardCard from "./dashboard-card.vue";
import RolesGraph from "./roles-graph.vue";

export default {
	name: "user-card",
	components: {
		DashboardCard,
		RolesGraph,
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
			url: "/users/stats",
		};
	},
	computed: {
		total() {
			if (this.data && this.data.total) return this.data.total;
			return "";
		},
		chart() {
			return this.$refs.chart;
		},
		series() {
			return this.data
				? Object.values(this.data.total_per_roles)
				: new Array(14).fill(undefined).map(() => 0);
		},
		labels() {
			return this.data
				? Object.keys(this.data.total_per_roles)
				: new Array(14).fill(undefined).map(() => "??");
		},
	},
	methods: {
		get() {
			axios.get(this.$root.apiURL + this.url, this.$root.apiOptions).then((res) => {
				this.data = res.data;
			});
		},
	},
	created() {
		this.get();
	},
};
</script>
