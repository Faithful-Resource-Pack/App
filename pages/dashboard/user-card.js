const DashBoardCard = () => import('./dashcard.js')
const RolesGraph = () => import('./roles-graph.js')

export default {
  name: 'user-card',
  components: {
    'dashboard-card': DashBoardCard,
    'roles-graph': RolesGraph
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
  :title="$root.lang('global.tabs.database.subtabs.users') || ''"
  go_to="/users"
  :can_go_to="admin"
>
  <v-card-text class="pb-3">
    <v-row class="py-0 my-0" v-if="data" dense>
      <v-col v-for="info in ['total_anonymous', 'total_roles']" :key="info" cols="12" sm="6">
        <p v-if="data[info] !== undefined" class="mb-0 rounded-lg pa-3">
          <span class="v-card__title pa-0 d-inline text--primary">{{ data[info] || 0 }}</span> {{ $root.lang('dashboard.users.' + info) }}
        </p>
      </v-col>
    </v-row>
    <roles-graph v-if="data" :series="series" :labels="labels" :colors="colors" />
  </v-card-text>
</dashboard-card>
  `,
  data: function() {
    return {
      data: undefined,
    }
  },
  computed:  {
    total: function() {
      if(this.data && this.data.total) return this.data.total
      return ""
    },
    chart: function() {
      return this.$refs.chart;
    },
    url: function() {
      return '/users/stats'
    },
    series: function() {
      return this.data ? Object.values(this.data.total_per_roles) : new Array(14).fill(undefined).map(() => 0)
    },
    labels: function() {
      return this.data ? Object.keys(this.data.total_per_roles) : new Array(14).fill(undefined).map(() => "??")
    }
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