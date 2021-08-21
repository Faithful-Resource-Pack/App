/* global axios */

export default {
  name: 'review-addons-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">
      Review Add-ons (WIP)
    </div>

    <v-badge inline dot left color="yellow"><h5 class="text-h5" style="margin-left: 5px;">Pending Approval</h5></v-badge>
    <v-expansion-panels v-if="pendingAddons.length != 0" style="margin-top: 5px;" multiple>
      <v-expansion-panel
        v-for="(addon, index) in pendingAddons"
        :key="index"
        rounded
        style="background-color: rgba(255, 255, 255, 0.05)"
      >
        <v-expansion-panel-header expand-icon="mdi-menu-down"
        >
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
            <v-col :cols="$vuetify.breakpoint.mdAndUp ? 6 : 12">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-text="'Description'" class="uppercased"/>
                  <v-container class="markdown text--secondary" style="margin-bottom: 10px; background-color: rgb(33,33,33); border-radius: 5px" v-html="compiledMarkdown(addon.description)"></v-container>
                  
                  <v-list-item-title v-text="'Links'" class="uppercased"/>
                  <div class="text--secondary child-break-line">
                    <template v-for="(links, key, index) in addon.downloads">
                      {{ key }}:
                      <ul>
                        <li v-for="(link, indexLink) in links">
                          <a :href="link">{{ link }} <v-icon small color="light-blue">mdi-open-in-new</v-icon></a>
                        </li>
                      </ul>
                      <br>
                    </template>
                  </div>
                  <br>
                  <v-list-item-title v-text="'Options'" class="uppercased"/>
                  <div>
                    <v-icon small v-text="addon.comments ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> Comments
                    <br>
                    <v-icon small v-text="addon.optifine ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"/> OptiFine
                  </div>

                </v-list-item-content>
              </v-list-item>
            </v-col>
            <v-col :cols="$vuetify.breakpoint.mdAndUp ? 6 : 12">
              <v-img :src="addon.images.header" :aspect-ratio="16/9" style="border-radius: 5px"></v-img>
            </v-col>

          </v-row>

          <v-row v-if="addon.images?.carousel.length > 0">
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

          <v-row style="margin-bottom: 0; justify-content: flex-end;">
            <v-col>
              <v-btn
                text
                color="teal"
              >
                Approve
              </v-btn>
              <v-btn
                text
                color="red"
              >
                Deny
              </v-btn>
            </v-col>
          </v-row>

        </v-expansion-panel-content>

      </v-expansion-panel>
    </v-expansion-panels>
    <template v-else><br>There is currently no waiting add-ons!<br></template>
    <br>

    <v-badge inline dot left color="red darken-4"><h5 class="text-h5" style="margin-left: 5px;">Denied</h5></v-badge>
    <v-expansion-panels v-if="deniedAddons.length != 0" style="margin-top: 5px;" multiple />
    <template v-else><br>There is currently no denied add-ons!<br></template>
    <br>

    <v-badge inline dot left color="teal"><h5 class="text-h5" style="margin-left: 5px;">Approved</h5></v-badge>
    <v-expansion-panels v-if="approvedAddons.length != 0" style="margin-top: 5px;" multiple />
    <template v-else><br>There is currently no approved add-ons!<br></template>


  </v-container>
  `,
  data() {
    return {
      pendingAddons: [],
      approvedAddons: [],
      deniedAddons: []
    }
  },
  methods: {
    compiledMarkdown(markdown) {
      return marked(markdown, { sanitize: true })
    },
    getPendingAddons: function () {
      axios.get('/addons/search/pending')
        .then(res => {
          this.pendingAddons = res.data

          this.pendingAddons.forEach(el => {
            el.type = el.type.sort()
          })

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