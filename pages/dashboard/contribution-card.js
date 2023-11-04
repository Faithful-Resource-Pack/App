const DashBoardCard = () => import("./dashcard.js");

export default {
	name: "contribution-card",
	components: {
		"dashboard-card": DashBoardCard,
	},
	props: {
		admin: {
			required: true,
			type: Boolean,
			default: false,
		},
		colors: {
			required: true,
			type: Array,
		},
		statsListener: {
			required: true,
			type: Function,
		},
	},
	template: `
<dashboard-card
  :title="$root.lang('global.tabs.database.subtabs.contributions') || ''"
  go_to="/contributions"
  :can_go_to="admin"
  class="d-flex flex-column"
>
  <v-card-text class="pb-3 flex-grow-1 d-flex align-stretch">
    <v-row class="mb-0" v-if="data" style="width: 100%">
      <v-col cols="12" sm="6" class="pr-sm-2 d-flex flex-column justify-space-around pb-0" v-for="(values, activity) in data.activity" :key="activity">
        <div class="title text-h6 text--primary">
          {{ $root.lang('dashboard.activity').replace('%s', activity.replace(/_/g, ' ')) }}
        </div>
        <div class="heatmap-wrapper">
          <calendar-heatmap
            :values="values"
            :end-date="today"
            :max="data.percentiles[activity]"
            :tooltip-unit="$root.lang('dashboard.totals.contributions')"
            :locale="locale"
            :range-color="colors"
          />
        </div>
      </v-col>
    </v-row>
    <v-row class="mb-0" v-else style="width: 100%">
      <v-col cols="12" sm="6" class="pr-sm-2 d-flex flex-column justify-space-around pb-0" v-for="i in 5" :key="'skeleton-'+i">
        <v-skeleton-loader height="24" type="heading" class="mb-2" />
        <v-skeleton-loader height="130" type="card" />
      </v-col>
    </v-row>
  </v-card-text>
</dashboard-card>
  `,
	data: function () {
		return {
			data: undefined,
		};
	},
	computed: {
		url: function () {
			return "/contributions/stats";
		},
		totals: function () {
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
		today: function () {
			return new Date();
		},
		locale: function () {
			return {
				months: moment.monthsShort().map((e) => e[0].toUpperCase() + e.slice(1)),
				days: moment.weekdaysShort().map((e) => e[0].toUpperCase() + e.slice(1)),
				...this.$root.lang().dashboard.locale,
			};
		},
	},
	methods: {
		get: function () {
			axios.get(this.$root.apiURL + this.url, this.$root.apiOptions).then((res) => {
				this.data = res.data;
			});
		},
	},
	created: function () {
		this.get();
	},
	watch: {
		totals: function (n, o) {
			if (!o) return; // o is undefined
			if (!o.length) return; // o is empty

			// run
			this.statsListener(n);
		},
	},
};
