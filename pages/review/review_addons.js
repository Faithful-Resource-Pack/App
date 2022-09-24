/* global axios */

const ExpPanel = () => import('./expansion_panel.js')
const DenyPopup = () => import('./deny_popup.js')
const ReviewCategories = () => import('./review_categories.js')
const ReviewList = () => import('./review_list.js')
const ReviewPreview = () => import('./review_previewer.js')
import searchMixin from '../../mixins/searchMixin.js'

export default {
  name: 'review-addons-page',
  components: {
    ExpPanel,
    DenyPopup,
    ReviewCategories,
    ReviewList,
    ReviewPreview
  },
  mixins: [searchMixin],
  template: `
  <v-container id="review-addons">
    <div class="styles" v-html="pageStyles"></div>
    <div class="text-h4 py-4">
      {{ $root.lang().review.titles.addons }}
    </div>

    <deny-popup
      :reasonPopup="showDenyPopup"
      :closePopup="closeDenyPopup"
    />

    <ReviewCategories
        :categories="categories"
        v-model="status"
        :activeColor="pageColor"
        :empty="empty"
    />

    <div id="review-content" class="mt-1 mb-2">
        <div v-if="selectedItems.length === 0" id="empty" class="rounded-lg d-flex text-center align-center justify-center">
<div><pre>
    d8888   .d8888b.      d8888  
   d8P888  d88P  Y88b    d8P888  
  d8P 888  888    888   d8P 888  
 d8P  888  888    888  d8P  888  
d88   888  888    888 d88   888  
8888888888 888    888 8888888888 
      888  Y88b  d88P       888  
      888   "Y8888P"        888  
</pre>
            <p class="my-2">{{ empty }}</p>
            </div>
        </div>
        <template v-if="selectedItems && selectedItems.length > 0">
            <div id="review-list">
                <ReviewList 
                    :items="selectedItems"
                    v-model="selectedAddonId"
                    :activeColor="pageColor"
                    :empty="empty"
                />
            </div><div id="review-previewer">
                <ReviewPreview
                    :addonId="selectedAddonId"
                    color="#9575cd"
                />
            </div>
        </template>
    </div>

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
      archive: false,
      status: 'pending',
      selectedAddonId: undefined,
    }
  },
  watch: {
    status: function(n) {
        // select first if not empty
        this.search_set('status', n)
        this.selectedAddonId = this.addons[n].length > 0 ? this.addons[n][0].id : undefined
    },
    selectedAddonId: function(n) {
        if(n !== undefined)
        this.search_set('id', n)
    }
  },
  computed: {
    stats: function() {
        return Object.values(this.addons)
            .map(v => v.length)
    },
    categories: function() {
        return Object.keys(this.addons).map((s,i) => {
            return {
                label: this.$root.lang(`review.titles.${s}`),
                color: this.colors[s],
                value: s,
                count: this.stats[i] !== undefined ? String(this.stats[i]) : ''
            }
        })
    },
    items: function() {
        return Object.entries(this.addons).map(([state, list]) => {
            return {
                state,
                items: list.map(addon => {
                    return {
                        key: String(addon.id),
                        primary: addon.name,
                        secondary: addon.options.tags.join(' | ')
                    }
                })
            }
        }).reduce((acc, cur) => {
            acc[cur.state] = cur.items
            return acc
        }, {})
    },
    selectedItems: function() {
        return this.items[this.status]
    },
    empty: function() {
        return this.$root.lang(`review.labels.${this.status}`)
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
          this.selectedAddonId = undefined
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
    },
    search_update: function() {
        const params = this.search_load()
        this.status = params.get('status') || this.status;
        this.$nextTick(() => {
            this.selectedAddonId = params.get('id') || this.selectedAddonId;
        })
    }
  },
  created: function() {
    this.search_update();
    window.addEventListener('hashchange', () => {
        this.search_update();
    }, false);
  },
  mounted() {
    this.update()
    window.updatePageStyles(this)

    this.$root.$on('openDenyPopup', (args) => {
        this.openDenyPopup(...args)
    })
  }
}
