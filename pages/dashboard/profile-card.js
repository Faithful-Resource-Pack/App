const DashBoardCard = () => import('./dashcard.js')

export default {
  name: 'profile-card',
  components: {
    'dashboard-card': DashBoardCard
  },
  template: `
<dashboard-card
  :title="$root.lang('global.tabs.user.subtabs.profile') || ''"
  go_to="/profile"
  :can_go_to="true"
  class="d-flex flex-column"
>
  <v-card-text v-if="user" class="pt-1 pb-3 d-flex flex-column justify-space-between flex-grow-1">

    <div class="text-center">
      <v-list-item-avatar
        tile
        class="rounded-lg my-3"
        size="80"
      >
        <v-img :src="user.avatar"></v-img>
      </v-list-item-avatar>
    </div>

    <div class="my-2">
      <div class="text-h5 text-center text--primary">
        {{ user.username }}
      </div>

      <div class="font-weight-light text--secondary text-center">
        {{ user.id }}
      </div>
    </div>

    <v-list dense>
      <v-list-item dense v-for="role in user.roles" :key="role">
        <v-list-item-title>{{ role }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card-text>
</dashboard-card>
  `,
  computed:  {
    user: function() {
      return this.$root.user
    }
  },
}