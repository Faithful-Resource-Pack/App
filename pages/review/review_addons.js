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
    <div class="styles" v-html="pageStyles"></div>
    <div class="text-h4 py-4">
      {{ $root.lang().review.titles.addons }}
    </div>

    <deny-popup
      :reasonPopup="showDenyPopup"
      :closePopup="closeDenyPopup"
    />

    <div
      v-for="status in Object.keys(addons)"
      :key="status"
    >
      <v-badge inline dot left :color="colors[status]"><h5 class="text-h5" style="margin-left: 5px;">{{ $root.lang().review.titles[status] }}</h5></v-badge>
      <v-expansion-panels v-if="addons[status].length > 0" style="margin-top: 5px;">
        <exp-panel
          :contributors="contributors"
          :color="pageColor"
          :addons="addons[status]"
          :reviewAddon="reviewAddon"
          :openDenyPopup="openDenyPopup"
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
      pageColor: 'deep-purple lighten-2',
      pageStyles: '',
      textColorOnPage: 'white--text',
      colors: {
        pending: 'yellow',
        denied: 'red',
        approved: 'teal',
        archived: 'grey'
      },
      addons: {
        pending: [],
        denied: [],
        approved: [],
        archived: []
      },
      loading: {
        pending: true,
        denied: true,
        approved: true,
        archived: true
      },
      contributors: [],

      showDenyPopup: false,
      denyAddon: {},
      archive: false
    }
  },
  methods: {
    reviewAddon: function (addon, status, reason = null) {
      if (!this.$root.isUserLogged) return

      const data = {
        status: status,
        reason: reason
      }

      axios
        .put(`${this.$root.apiURL}/addons/${addon.id}/review`, data, this.$root.apiOptions)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.update()
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    },
    closeDenyPopup: function (send = false, reason) {
      this.showDenyPopup = false
      if (send) this.reviewAddon(this.denyAddon, this.archive ? 'archived' : 'denied', reason)
    },
    openDenyPopup: function (addon, archive=undefined) {
      this.archive = !!archive
      this.showDenyPopup = true
      this.denyAddon = addon
    },
    getAddonsByStatus(status) {
      axios.get(`${this.$root.apiURL}/addons/${status}`, this.$root.apiOptions).then(res => {
        this.addons[status] = res.data
        this.addons[status].forEach(addon => (addon.options.tags = addon.options.tags.sort()))
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
      this.getAddonsByStatus('archived')
    }
  },
  mounted() {
    this.update()
    window.updatePageStyles(this)
  }
}
