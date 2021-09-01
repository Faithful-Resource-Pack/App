/* global axios */

const addonEditModal = () => import('./modal_edit.js')
const addonRemoveConfirm = () => import('./remove-confirm.js')

export default {
  name: 'own-addon-page',
  components: {
    addonEditModal,
    addonRemoveConfirm
  },
  template: `
  <v-container>
    <div class="text-h4 py-4">
      {{ $root.lang().addons.titles.submissions }}
      <v-progress-circular
        v-if="loading"
        indeterminate
      />
    </div>

    <div v-if="loading == false && Object.keys(addons).length == 0">
      {{ $root.lang().global.no_results }}
    </div>
    <div v-else class="my-2 text-h5">
      <v-row>
        <v-col :cols="$vuetify.breakpoint.mdAndUp ? 4 : ($vuetify.breakpoint.smAndUp ? 6 : 12)" v-if="Object.keys(addons).length != 0" v-for="(addon, index) in addons" :key="index">

          <v-card style="background-color: rgba(255,255,255,.05)">
            <v-img
              style="border-radius: 5px"
              :src="addon.images.header"
              :aspect-ratio="16/9"
            />
            <v-card-title v-text="addon.title" />
            <v-card-subtitle v-text="addon.type.join(', ')" />
            <v-card-text style="height: 60px">
              <v-badge
                dot
                inline
                :color="addon.status == 'approved' ? 'green' : (addon.status == 'pending' ? 'yellow' : 'red')"
              />
              {{ $root.lang().addons.status[addon.status] }}
              <v-btn
                v-if="addon.status == 'approved'"
                color="blue"
                :href="'https://www.compliancepack.net/addons#/' + addon.id"
                target="_blank"
                icon
                small
              >
                <v-icon small>mdi-open-in-new</v-icon>
              </v-btn>
              <template v-if="addon.status == 'denied'">: {{ addon.approval?.reason }}</template>
            </v-card-text>

            <v-card-actions style="justify-content: flex-end;">
              <v-btn
                color="white"
                text
                @click="editAddon(addon)"
              >
                {{ $root.lang().global.btn.edit }}
              </v-btn>
              <v-btn
                color="red"
                text
                @click="deleteAddon(addon)"
              >
                {{ $root.lang().global.btn.delete }}
              </v-btn>
            </v-card-actions>
          </v-card>
              
        </v-col>
      </v-row>
    </div>
    <addon-remove-confirm :confirm="remove.confirm" :disableDialog="function() { remove.confirm = false; update() }" :data="remove.data"></addon-remove-confirm>

    <addon-edit-modal
      :dialog="dialogOpen"
      :disableDialog="closeDialog"
      :data="dialogAddon"
    ></addon-edit-modal>

  </v-container>
  `,
  data () {
    return {
      addons: {},
      remove: {
        confirm: false,
        data: {}
      },
      dialogAddon: {},
      dialogOpen: false,
      loading: true
    }
  },
  methods: {
    closeDialog: function () {
      this.dialogOpen = false
      this.dialogAddon = {}
      this.update()
    },
    editAddon: function (addon) {
      this.dialogAddon = addon
      this.dialogOpen = true
    },
    deleteAddon: function (addon) {
      this.remove.data = addon
      this.remove.confirm = true
    },
    getAddons: function (authorID) {
      axios.get('/addons/search/author', {
        params: {
          authorID: authorID
        }
      })
        .then((res) => {
          this.addons = res.data
          this.loading = false
          this.$forceUpdate()
        })
        .catch(function (err) {
          console.error(err)
        })
    },
    update: function () {
      this.getAddons(this.$root.user.id)
      this.$forceUpdate()
    }
  },
  mounted () {
    this.getAddons(this.$root.user.id)
  }
}
