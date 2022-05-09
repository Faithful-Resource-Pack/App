const DashBoardCard = () => import('./dashcard.js')

export default {
  name: 'contribution-card',
  components: {
    'dashboard-card': DashBoardCard,
  },
  props: {
    admin: {
      required: true,
      type: Boolean,
      default: false
    },
    colors: {
      required: true,
      type: Array
    }
  },
  template: `
<dashboard-card
  :title="$root.lang('global.tabs.database.subtabs.contributions') || ''"
  go_to="/contributions"
  :can_go_to="admin"
  class="d-flex flex-column"
>
  <v-card-text class="pb-3 flex-grow-1 d-flex align-stretch">
    <v-row dense v-if="data" class="col-12 pa-0">
      <v-col cols="12" sm="4" class="d-flex align-stretch pr-sm-4 pb-sm-8">
        <v-row dense class="d-flex flex-column justify-space-between">
          <v-col v-for="total in totals" :key="total.name" class="flex-sm-shrink-0 flex-grow-0">
            <p class="mb-0 rounded-lg pa-3">
              <span class="v-card__title pa-0 d-inline text--primary">{{ total.value }}</span>{{ ' ' + $root.lang('dashboard.totals.' + total.name) }}
            </p>
          </v-col>
        </v-row>
      </v-col>
      <v-col class="pr-sm-2" cols="12" sm="8" class="d-flex flex-column justify-space-around">
        <div v-for="(values, activity) in data.activity" :key="activity">
          <div class="title text-h6 text--primary">
            {{ $root.lang('dashboard.activity').replace('%s', activity.replace('_', ' ')) }}
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
        <div>
      </v-col>
    </v-row>
  </v-card-text>
</dashboard-card>
  `,
  data: function() {
    return {
      data: undefined,
    }
  },
  computed:  {
    url: function() {
      return '/contributions/stats'
    },
    totals: function() {
      if(!this.data) return [,,,]
      return Object.keys(this.data).filter(e => e.includes('total')).map(e => {
        return {
          name: e.replace('total_', ''),
          value: this.data[e],
        }
      })
    },
    today: function() {
      return new Date()
    },
    locale: function() {
      return {
        months: moment.monthsShort().map(e => e[0].toUpperCase() + e.slice(1)),
        days: moment.weekdaysShort().map(e => e[0].toUpperCase() + e.slice(1)),
        ...this.$root.lang().dashboard.locale
      }
    },
  },
  methods: {
    get: function() {
      axios.get(this.$root.apiURL + this.url, this.$root.apiOptions)
        .then(res => {
          this.data = res.data
        })
    }
  },
  created: function() {
    this.get()
  },
}