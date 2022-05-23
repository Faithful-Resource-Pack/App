const AddonCard = () => import('./addon-card.js')
const ProfileCard = () => import('./profile-card.js')
const UserCard = () => import('./user-card.js')
const ContributionCard = () => import('./contribution-card.js')
const ComplianceCard = () => import('./compliance-card.js')

export default {
  name: 'dashboardPage',
  components: {
    'addon-card': AddonCard,
    'profile-card': ProfileCard,
    'user-card': UserCard,
    'contribution-card': ContributionCard,
    'compliance-card': ComplianceCard
  },
  template: `
<div id="dashboard-page" class="pa-2 py-sm-4 px-sm-6">
  <div class="title text-h4 py-4">
    {{ $root.user.username ? $root.lang('dashboard.welcome_user').replace('%USER%', $root.user.username) : $root.lang('dashboard.welcome') }}
  </div>

  <v-row id="dashboard-row">
    <v-col cols="12" sm="3">
      <profile-card v-if="$root.isUserLogged"/>
      <compliance-card v-else />
    </v-col>
    <v-col cols="12" sm="9">
      <user-card :admin="admin" :colors="colors"/>
    </v-col>
    <v-col cols="12" sm="9">
      <contribution-card :admin="admin" :colors="colors" />
    </v-col>
    <v-col cols="12" sm="3">
      <addon-card :admin="admin" />
    </v-col>
  </v-row>
</div>  
`,
  computed: {
    admin: function() {
      // if not logged in
      if(!this.$root.isUserLogged) return false

      // if user not loaded
      if(!this.$root.user) return false

      // check roles
      return this.$root.user.roles.includes('Administrator') || this.$root.user.roles.includes('Developer')
    },
    colors: function() {
      // https://colordesigner.io/gradient-generator
      if(this.$root.isDark) {
        return [
          "#1e1e1e",
          "#303c27",
          "#425d30",
          "#537f38",
          "#65a33f",
          "#76c945"
        ]
      } else {
        return [
          "#f0f0f0",
          "#b5dd9e",
          "#a6d889",
          "#97d374",
          "#87ce5d",
          "#76c945",
        ]
      }
    }
  }
}