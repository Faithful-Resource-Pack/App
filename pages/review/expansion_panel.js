const AddonEditModal = () => import('./addon_modal_edit.js')

export default {
  name: 'exp-panel',
  components: {
    AddonEditModal
  },
  template:
  `
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
    >
      <v-expansion-panel-header expand-icon="mdi-menu-down">
        <v-row no-gutters>
          <v-col
            cols="12"
            class="uppercased"
          >
            {{ addon.title }}
          </v-col>
          <v-col
            cols="12"
            class="text--secondary uppercased"
            style="margin-top: 2.5px;"
          >
            {{ addon.type.join(' | ') }}
          </v-col>
        </v-row>

      </v-expansion-panel-header>

      <v-expansion-panel-content style="background: rgba(255, 255, 255, 0.05); padding-top: 10px;">
        <v-row>
          <v-col :cols="$vuetify.breakpoint.mdAndUp ? 6 : 12" style="padding-left: 0">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title v-text="$root.lang().review.addon.titles.authors" class="uppercased" />
                <div class="text--secondary" style="margin-bottom: 10px;" >
                  {{ addon.authors.map(id => getUsername(id)).join(", ") }}
                </div>

                <v-list-item-title v-text="$root.lang().review.addon.titles.description" class="uppercased"/>
                <v-container class="markdown text--secondary" style="margin-bottom: 10px; background-color: rgb(33,33,33); border-radius: 5px" v-html="$root.compiledMarkdown(addon.description)"></v-container>

                <v-list-item-title v-text="$root.lang().review.addon.titles.links" class="uppercased"/>
                <div class="text--secondary" style="margin-bottom: 10px;">
                  <template v-for="(links, key) in addon.downloads">
                    <div :key="'title-' + key">{{ key }}:</div>
                    <ul :key="'ul-' + key">
                      <li v-for="(link, indexLink) in links" :key="indexLink" style="background-color: transparent">
                        <a :href="link" class="text--secondary">{{ $root.lang().review.addon.labels.link }} {{ indexLink + 1 }}<v-icon small color="light-blue">mdi-open-in-new</v-icon></a>
                      </li>
                    </ul>
                    <br :key="'br-' + key">
                  </template>
                </div>
                
                <v-list-item-title v-text="$root.lang().review.addon.titles.options" class="uppercased"/>
                <div>
                  <v-icon small v-text="addon.comments ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> {{ $root.lang().review.addon.labels.comments }}
                  <br>
                  <v-icon small v-text="addon.optifine ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> {{ $root.lang().review.addon.labels.optifine }}
                </div>

              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col :cols="$vuetify.breakpoint.mdAndUp ? 6 : 12">
            <v-img :src="addon.images.header" :aspect-ratio="16/9" style="border-radius: 5px"></v-img>
          </v-col>

        </v-row>

        <v-row v-if="addon.images && addon.images.carousel.length > 0">
          <v-col
            v-for="index in addon.images.carousel"
            :key="index"
            :cols="$vuetify.breakpoint.mdAndUp ? 4 : 6"
          >
            <v-img
              style="border-radius: 5px"
              :aspect-ratio="16/9"
              :src="index"
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
              :disabled="addon.status == 'approved'"
              @click="approveAddon(addon)"
            >
              {{ $root.lang().global.btn.approve }}
            </v-btn>
            <v-btn
              text
              color="red"
              :disabled="addon.status == 'denied'"
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
    }
  },
  data () {
    return {
      dialogAddon: {},
      dialogOpen: false
    }
  },
  methods: {
    openDialog: function (addon) {
      this.dialogAddon = addon
      this.dialogOpen = true
    },
    closeDialog: function () {
      this.dialogOpen = false
      this.dialogAddon = {}
      this.update()
    },
    getUsername: function (id) {
      if (id == null || !id) return this.$root.lang().review.addon.labels.old_addon

      return this.contributors.filter(el => el.id === id)[0]?.username
    }
  }
}
