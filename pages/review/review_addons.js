/* global axios */

const ExpPanel = () => import('./expansion_panel.js')
const DenyPopup = () => import('./deny_popup.js')

export default {
  name: 'review-addons-page',
  components: {
    ExpPanel,
    DenyPopup
  },
  template: `
  <v-container>
    <div class="text-h4 py-4">
      {{ $root.lang().review.titles.addons }}
    </div>

    <deny-popup
      :reasonPopup="showDenyPopup"
      :closePopup="closeDenyPopup"
      :validPopup="denyAddon"
    />

    <div
      v-for="status in Object.keys(addons)"
      :key="status"
    >
      <v-badge inline dot left :color="colors[status]"><h5 class="text-h5" style="margin-left: 5px;">{{ $root.lang().review.titles[status] }}</h5></v-badge>
      <v-expansion-panels v-if="addons[status].length > 0" style="margin-top: 5px;">
        <exp-panel
          :contributors="contributors"
          :addons="addons[status]"
          :approveAddon="approveAddon"
          :denyAddon="openDenyPopup"
          :update="update"
          :status="status"
        />
      </v-expansion-panels>
      <template v-else-if="loading[status] === true"><v-container>{{ $root.lang().global.loading }}</v-container></template>
      <template v-else><v-container>{{ $root.lang().review.labels[status] }}</v-container></template>
      <br>
    </div>
  </v-container>
  `,
  data() {
    return {
      colors: {
        pending: 'yellow',
        denied: 'red',
        approved: 'teal'
      },
      addons: {
        pending: [],
        denied: [],
        approved: []
      },
      loading: {
        pending: true,
        denied: true,
        approved: true
      },
      contributors: [],

      showDenyPopup: false,
      denyReason: '',
      deniedAddon: {}
    }
  },
  methods: {
    approveAddon: function (addon) {
      if (!this.$root.isUserLogged) return

      const data = {
        token: this.$root.user.access_token,
        approval: {
          author: this.$root.user.id,
          reason: null
        },
        id: addon.id
      }

      // todo : USE THE V2 API HERE
      axios
        .post('/review/addons/approve', data)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.update()
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    },
    denyAddon: function (reason) {
      if (!this.$root.isUserLogged) return

      const data = {
        token: this.$root.user.access_token,
        approval: {
          author: this.$root.user.id,
          reason: reason
        },
        id: this.deniedAddon.id
      }

      // if the addon was approved -> denied
      let updateApproved = false
      if (this.deniedAddon.status == 'approved') updateApproved = true

      // todo : USE THE V2 API HERE
      axios
        .post('/review/addons/deny', data)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.update()
          if (updateApproved) this.getApprovedAddons()
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })

      this.closeDenyPopup()
    },
    closeDenyPopup: function () {
      this.showDenyPopup = false
      this.deniedAddon = {}
    },
    openDenyPopup: function (addon) {
      this.showDenyPopup = true
      this.deniedAddon = addon
    },
    getAddonsByStatus(status) {
      axios
        .get(`${this.$root.apiURL}/addons/status/${status}`)
        .then(res => {
          this.addons[status] = res.data
          this.addons[status].forEach(addon => addon.options.tags = addon.options.tags.sort())
          this.loading[status] = false
          this.$forceUpdate()
        }) // todo: add API verification for 404 errors
    },
    getContributors: function () {
      axios
        .get(`${this.$root.apiURL}/users/names`)
        .then(res => {
          this.contributors = res.data
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    },
    update: function () {
      this.getContributors()
      this.getAddonsByStatus('pending')
      this.getAddonsByStatus('denied')
      this.getAddonsByStatus('approved')
    }
  },
  mounted() {
    this.update()
  }
}
