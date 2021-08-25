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
      Review Add-ons
    </div>

    <deny-popup
      :reasonPopup="showDenyPopup"
      :closePopup="closeDenyPopup"
      :validPopup="denyAddon"
    />

    <v-badge inline dot left color="yellow"><h5 class="text-h5" style="margin-left: 5px;">Pending Approval</h5></v-badge>
    <v-expansion-panels v-if="pendingAddons.length != 0" style="margin-top: 5px;" multiple>
      <exp-panel
        :contributors="contributors" 
        :addons="pendingAddons"
        :approveAddon="approveAddon"
        :denyAddon="openDenyPopup"
      />
    </v-expansion-panels>
    <template v-else-if="pendingLoading"><v-container>Loading, please wait...</v-container></template>
    <template v-else><v-container>There is currently no Pending add-ons!</v-container></template>
    <br>

    <v-badge inline dot left color="red darken-4"><h5 class="text-h5" style="margin-left: 5px;">Denied</h5></v-badge>
    <v-expansion-panels v-if="deniedAddons.length != 0" style="margin-top: 5px;" multiple>
      <exp-panel
        :contributors="contributors"
        :addons="deniedAddons"
        :approveAddon="approveAddon"
        :denyAddon="openDenyPopup"
      />
    </v-expansion-panels>
    <template v-else-if="deniedLoading"><v-container>Loading, please wait...</v-container></template>
    <template v-else><v-container>There is currently no Denied add-ons!</v-container></template>
    <br>

    <v-badge inline dot left color="teal"><h5 class="text-h5" style="margin-left: 5px;">Approved</h5></v-badge>
    <v-expansion-panels v-if="approvedAddons.length != 0" style="margin-top: 5px;" multiple>
      <exp-panel
        :contributors="contributors"
        :addons="approvedAddons"
        :approveAddon="approveAddon"
        :denyAddon="openDenyPopup"
      />
    </v-expansion-panels>
    <template v-else-if="approvedLoading"><v-container>Loading, please wait...</v-container></template>
    <template v-else><v-container><v-btn text color="teal" @click="getApprovedAddons()">Load Approved Add-ons</v-btn></v-container></template>
  </v-container>
  `,
  data() {
    return {
      pendingAddons: [],
      approvedAddons: [],
      deniedAddons: [],
      contributors: [],

      pendingLoading: true,
      approvedLoading: false,
      deniedLoading: true,

      showDenyPopup: false,
      denyReason: "",
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

      axios.post('/review/addons/approve', data)
      .then(() => {
        this.$root.showSnackBar('Ended successfully', 'success')
        this.$forceUpdate()
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

      axios.post('/review/addons/deny', data)
      .then(() => {
        this.$root.showSnackBar('Ended successfully', 'success')
        this.$forceUpdate()
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
    getPendingAddons: function () {
      axios.get('/addons/search/pending')
        .then(res => {
          this.pendingAddons = res.data

          this.pendingAddons.forEach(el => {
            el.type = el.type.sort()
          })

          this.pendingLoading = false

          this.$forceUpdate()
        })
        .catch(err => {
          console.trace(err)
        })
    },
    getDeniedAddons: function () {
      axios.get('/addons/search/denied')
        .then(res => {
          this.deniedAddons = res.data

          this.deniedAddons.forEach(el => {
            el.type = el.type.sort()
          })
          
          this.deniedLoading = false

          this.$forceUpdate()
        })
        .catch(err => {
          console.trace(err)
        })
    },
    getApprovedAddons: function () {
      this.approvedLoading = true
      
      axios.get('/addons/search/approved')
        .then(res => {
          this.approvedAddons = res.data

          this.approvedAddons.forEach(el => {
            el.type = el.type.sort()
          })

          this.approvedLoading = false

          this.$forceUpdate()
        })
        .catch(err => {
          console.trace(err)
        })
    },
    getContributors: function() {
      axios.get('/contributors/all/')
        .then(res => {
          this.contributors = res.data

          this.getPendingAddons()
          this.getDeniedAddons()
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    }
  },
  mounted() {
    this.getContributors()
  }
}