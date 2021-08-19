/* global axios */

export default {
  name: 'review-addons-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">
      Review Add-ons (WIP)
    </div>



    <v-badge inline dot left color="yellow"><h5 class="text-h5" style="margin-left: 5px;">Pending</h5></v-badge>
    <v-list
      rounded
      color="rgba(255, 255, 255, 0.05)"
    >
      <template v-if="pendingAddons.length !=0">
        <v-list-item
          v-for="(addon, index) in pendingAddons"
        >
          <v-list-item-content>
            <v-list-item-title v-text="addon.title" />
            <v-list-item-subtitle v-text="addon.type.join(' | ')" />
          </v-list-item-content>
          <v-list-item-content>
            <v-list-item-title>
              <v-icon small v-text="addon.comments ? 'mdi-checkbox-marked-outline' : 'checkbox-blank-outline'"/>
              Comments
            </v-list-item-title>
            <v-list-item-title>
              <v-icon small v-text="addon.optifine ? 'mdi-checkbox-marked-outline' : 'checkbox-blank-outline'"/>
              OptiFine
            </v-list-item-title>
            <v-list-item-title>

            </v-list-item-title>
          </v-list-item-content>

        </v-list-item>
      </template>
      <template v-else><v-list-item>No add-ons...</v-list-item></template>

    </v-list>

    <div class="text-h6 py-6">
      Other
    </div>

    <div class="text-h6 py-6">
      Approved
    </div>

  </v-container>
  `,
  data() {
    return {
      pendingAddons: [],
      approvedAddons: [],
      otherAddons: []
    }
  },
  methods: {
    getPendingAddons: function () {
      axios.get('/addons/search/pending')
        .then(res => {
          this.pendingAddons = res.data
          this.$forceUpdate()
        })
        .catch(err => {
          console.trace(err)
        })
    },
    getApprovedAddons: function () {
      axios.get('/addons/search/approved')
        .then(res => {
          this.approvedAddons = res.data
          this.$forceUpdate()
        })
        .catch(err => {
          console.trace(err)
        })
    }
  },
  mounted() {
    this.getPendingAddons()
  }
}