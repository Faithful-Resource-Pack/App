const DashBoardCard = () => import('./dashcard.js')

export default {
  name: 'profile-card',
  components: {
    'dashboard-card': DashBoardCard
  },
  props: {
    show: {
      required: true
    },
  },
  template: `
<dashboard-card
  :title="$root.lang('global.tabs.user.subtabs.profile') || ''"
  go_to="/profile"
  :can_go_to="true"
  class="d-flex flex-column"
  :style="{ display: show ? 'inherit' : 'none !important' }"
>
  <v-card-text v-if="user" class="pt-1 pb-3 d-flex flex-column justify-space-between flex-grow-1">
  <div v-if="user.roles.length === 0"></div>

    <div class="text-center">
      <v-list-item-avatar
        tile
        class="rounded-lg my-3 mr-0 primary"
        size="80"
      >
        <v-img :src="user.avatar" v-if="user.avatar"></v-img>
        <div class="text-h5 text-center text--primary font-weight-medium" v-else>{{ user.username.charAt(0) }} </div>
      </v-list-item-avatar>
    </div>

    <div class="my-2">
      <div class="text-h5 text-center text--primary" id="user-username">
        {{ user.username }}
      </div>

      <div class="font-weight-light text--secondary text-center">
        {{ user.id }}
      </div>
    </div>

    <p class="text-center d-flex justify-center align-center rounded-lg pa-3 mb-0" v-if="user.roles.length">
      <span v-html="user.roles.join('<br>')"></span>
    </p>
    <div v-else></div>
  </v-card-text>
</dashboard-card>
  `,
  computed:  {
    user: function() {
      return this.$root.user
    }
  },
}