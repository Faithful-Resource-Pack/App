const DashBoardCard = () => import('./dashcard.js')

export default {
  name: 'addon-card',
  components: {
    'dashboard-card': DashBoardCard
  },
  props: {
    admin: {
      required: true,
      type: Boolean,
      default: false
    }
  },
  template: `
<dashboard-card
  id="addon-card"
  :title="$root.lang('global.tabs.addons.title') || ''"
  go_to="/review/addons"
  :can_go_to="admin"
  class="d-flex flex-column justify-space-between"
>
  <v-card-text class="pb-0 flex-grow-1 d-flex flex-column">
    <v-row class="py-0 my-0" v-if="data" dense class="d-flex align-stretch">
      <template v-for="status in statuses">
        <v-col v-if="data[status] !== undefined" :key="status" cols="12" :class="['d-flex align-stretch', $root.isUserLogged ? 'col-sm-3' : '']">
          <p class="mb-0 rounded-lg pa-2">
            <span :class="['v-card__title pa-0 d-inline', status_color[status]]">{{ data[status] || 0 }}</span> {{ $root.lang('review.titles.' + status) }}
          </p>
        </v-col>
      </template>
    </v-row>
    <v-row class="mt-1 py-0 my-0 align-self-stretch" v-if="data" dense>
      <v-col v-for="(number, tag) in data.numbers" :key="tag" cols="12" sm="3" class="d-flex align-stretch">
        <p class="mb-0 rounded-lg pa-2">
          <span class="v-card__title pa-0 d-inline text--primary">{{ number }}</span>{{ ' ' + tag }}
        </p>
      </v-col>
    </v-row>
  </v-card-text>

  <v-card-actions class="d-flex mt-0 px-4 pt-1">
    <v-row dense><v-col>
      <v-btn
        block
        text
        color="primary"
        :to="'/addons/submissions'"
      >
        Submissions
      </v-btn></v-col>
      <v-col><v-btn
        block
        text
        color="primary"
        :to="'/addons/new'"
      >
        Upload
      </v-btn></v-col>
    </v-row>
  </v-card-actions>
</dashboard-card>
  `,
  data: function() {
    return {
      data: undefined,
      status_color: {
        approved: 'success--text',
        pending: 'warning--text',
        denied: 'error--text',
        archived: 'grey--text'
      }
    }
  },
  computed:  {
    statuses: function() {
      return Object.keys(this.status_color)
    },
    roles: function() {
      return this.$root.user.roles.length
    },
    url: function() {
      return '/addons/stats' + (this.admin ? '-admin' : '')
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
  watch: {
    roles: function(n, o) {
      if(n != o && this.admin) {
        this.get()
      }
    } 
  }
}