const AddonEditModal = () => import('./addon_modal_edit.js')

export default {
  name: 'exp-panel',
  components: {
    AddonEditModal
  },
  template: `
  <v-container>
    <addon-edit-modal
      :dialog="dialogOpen"
      :disableDialog="closeDialog"
      :data="dialogAddon"
      :contributors="contributors"
    ></addon-edit-modal>

    <v-expansion-panel
      v-for="(addon, index) in addons"
      :key="index"
      rounded
      style="background-color: rgba(255, 255, 255, 0.05)"
      @click="getAddon(addon.id)"
    >
      <v-expansion-panel-header expand-icon="mdi-menu-down">
        <v-row no-gutters>
          <v-col
            cols="12"
            class="uppercased"
          >
            {{ addon.name }}
          </v-col>
          <v-col
            cols="12"
            class="text--secondary uppercased"
            style="margin-top: 2.5px;"
          >
            {{ addon.options.tags.join(' | ') }}
          </v-col>
        </v-row>

      </v-expansion-panel-header>

      <v-expansion-panel-content style="background: rgba(255, 255, 255, 0.05); padding-top: 10px;">
        <template v-if="addonInPanelLoading === true">
          <p>{{ $root.lang().global.loading }}</p>
        </template>
        <template v-else>
          <v-row>
            <v-col :cols="$vuetify.breakpoint.mdAndUp ? 6 : 12" style="padding-left: 0">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-text="$root.lang().review.addon.titles.authors" class="uppercased" />
                  <div class="text--secondary" style="margin-bottom: 10px;" >
                    {{ addonInPanel.authors.map(id => getUsername(id)).join(", ") }}
                  </div>

                  <v-list-item-title v-text="$root.lang().review.addon.titles.description" class="uppercased"/>
                  <v-container class="markdown text--secondary" style="margin-bottom: 10px; background-color: rgb(33,33,33); border-radius: 5px" v-html="$root.compiledMarkdown(addonInPanel.description)"></v-container>

                  <v-list-item-title v-text="$root.lang().review.addon.titles.links" class="uppercased"/>
                  <div class="text--secondary" style="margin-bottom: 10px;">
                    <ul v-for="file in addonInPanel.files.filter(f => f.use === 'download')">
                      <li>
                        {{ file.name }} - 
                        <a :href="file.source" class="text--secondary">
                          {{ $root.lang().review.addon.labels.link }}
                          <v-icon small color="light-blue">mdi-open-in-new</v-icon>
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <v-list-item-title v-text="$root.lang().review.addon.titles.options" class="uppercased"/>
                  <div>
                    <v-icon small v-text="addonInPanel.options.comments ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> {{ $root.lang().review.addon.labels.comments }}
                    <br>
                    <v-icon small v-text="addonInPanel.options.optifine ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> {{ $root.lang().review.addon.labels.optifine }}
                  </div>

                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col :cols="$vuetify.breakpoint.mdAndUp ? 6 : 12">
              <v-img :src="$root.apiURL + 'addons/' + addonInPanel.id + '/files/header'" :aspect-ratio="16/9" style="border-radius: 5px" alt="Header not found!">
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                    style="background-color: rgba(255,255,255, 0.1);"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    />
                  </v-row>
                </template>
              </v-img>
            </v-col>

          </v-row>

          <v-row v-if="addonInPanel.files.filter(f => f.use === 'carousel').length > 0">
            <v-col
              v-for="file in addonInPanel.files.filter(f => f.use === 'carousel')"
              :key="file.id"
              :cols="$vuetify.breakpoint.mdAndUp ? 4 : 6"
            >
              <v-img
                style="border-radius: 5px"
                :aspect-ratio="16/9"
                :src="file.source"
              />
            </v-col>
          </v-row>

          <v-row v-if="addon.status == 'approved' && addon.approval.author != null">
            <v-col style="padding-left: 16px">
              <v-list-item-title v-text="$root.lang().review.addon.labels.approved_by" class="uppercased"/>
              <p class="text--secondary">{{ getUsername(addon.approval.author) }}</p>
            </v-col>
          </v-row>
          <v-row v-if="addon.status == 'denied'">
            <v-col style="padding-left: 16px">
              <v-list-item-title v-text="$root.lang().review.addon.labels.denied_by" class="uppercased"/>
              <p class="text--secondary">{{ getUsername(addon.approval.author) }}</p>
              <v-list-item-title v-text="$root.lang().review.addon.labels.reason" class="uppercased"/>
              <p class="text--secondary">{{ addon.approval.reason }}</p>
            </v-col>
          </v-row>
          <v-row style="margin-bottom: 0; justify-content: flex-end;">
            <v-col>
              <v-btn
                text
                color="teal"
                :disabled="status == 'approved'"
                @click="approveAddon(addon)"
              >
                {{ $root.lang().global.btn.approve }}
              </v-btn>
              <v-btn
                text
                color="red"
                :disabled="status == 'denied'"
                @click="denyAddon(addon)"
              >
                {{ $root.lang().global.btn.deny }}
              </v-btn>
              <v-btn
                text
                color="yellow"
                @click="openDialog(addon)"
              >
                {{ $root.lang().global.btn.edit }}
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-container>
  `,
  props: {
    addons: {
      type: Array,
      required: true
    },
    approveAddon: {
      type: Function,
      required: true
    },
    denyAddon: {
      type: Function,
      required: true
    },
    contributors: {
      type: Array,
      required: true
    },
    update: {
      type: Function,
      required: true
    },
    status: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialogAddon: {},
      dialogOpen: false,

      addonInPanelLoading: true,
      addonInPanel: {}
    }
  },
  methods: {
    getAddon: function (id) {
      this.addonInPanelLoading = true

      axios
        .get(`${this.$root.apiURL}addons/${id}/all`)
        .then(res => {
          // void value if already here (closing tab)
          if (this.addonInPanel.id === res.data.id) {
            this.addonInPanel = {}
            this.addonInPanelLoading = true
            return
          }

          this.addonInPanel = res.data
          this.addonInPanelLoading = false
        })
    },
    openDialog: function () {
      this.dialogAddon = this.addonInPanel
      this.dialogOpen = true
    },
    closeDialog: function () {
      this.dialogOpen = false
      this.dialogAddon = {}
      this.update()
    },
    getUsername: function (id) {
      return this.contributors[id].username || 'Unknown User';
    }
  }
}
