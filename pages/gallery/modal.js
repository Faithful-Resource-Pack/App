/* global axios, Vue */

export default {
  name: 'texture-modal',
  template: `
    <v-dialog
      v-model="opened"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      @click.stop="() => closeModal()"
    >

      <v-card>
        <v-toolbar>
          <v-btn
            icon
            @click.stop="() => closeModal()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          
          <template v-if="Object.keys(textureObj).length > 0">
            <v-toolbar-title>[#{{ textureID }}] {{ textureObj.texture.name }}</v-toolbar-title>
          
            <v-spacer></v-spacer>

            <v-btn icon @click="() => $parent.copyShareLink(textureID)">
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </template>
          <template v-else>
            <v-toolbar-title>{{ $root.lang().global.loading }}</v-toolbar-title>
          </template>
        </v-toolbar>

        <template v-if="Object.keys(textureObj).length > 0">

          <div class="gallery-dialog-container">
            <div class="gallery-dialog-textures">
              <template v-for="res in resolutions">
                <div class="gallery-dialog-texture-container">
                  <div class="gallery-dialog-texture">
                    <img class="gallery-texture-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; this.parentElement.style.background='rgba(0,0,0,0.3)';this.parentElement.classList.add('rounded')" :src="getTextureURL(res)" lazy-src="https://database.faithfulpack.net/images/bot/loading.gif" />
                    <div class="not-done" style="display: none;">
                      <span></span><div>
                        <p>{{ $root.lang().gallery.error_message.texture_not_done }}</p>
                      </div>
                    </div>
                  </div>
                  <h2>{{ res }}</h2>
                </div>
              </template>
            </div>

            <div style="width: 70%; padding: 30px">
              <v-tabs
                v-model="tab"
                align-with-title
              >
                <v-tabs-slider></v-tabs-slider>

                <v-tab
                  v-for="item in items"
                  :key="item"
                  style="text-transform: uppercase"
                >
                  {{ item }}
                </v-tab>
              </v-tabs>

              <v-tabs-items v-model="tab">
                <v-tab-item
                  v-for="item in items"
                  :key="item"
                >
                  <template v-if="item === items[0]">
                    <template v-for="i in infos">
                      <div style="padding: 15px">
                        <h2>{{ infosText[i] }}</h2>
                        <v-data-table
                          dense
                          :headers="getHeaders(i)"
                          :items="getItems(i)"
                          class="elevation-1"
                          style="margin-top: 10px"
                          hide-default-footer
                        ></v-data-table>
                      </div>
                    </template>
                  </template>
                  <div v-if="item === items[1]" class="double_table">
                    <template v-for="i in authors">
                      <div style="padding: 15px">
                        <h2 style="text-transform: capitalize;">{{ i }}</h2>
                        <v-data-table
                          dense
                          :headers="getHeaders(i)"
                          :items="getItems(i)"
                          class="elevation-1"
                          style="margin-top: 10px"
                          hide-default-footer
                        ></v-data-table>
                      </div>
                    </template>
                  </div>
                  <div v-if="item === items[2]">
                    {{ $root.lang().global.nyi }}
                  </div>
                  <div v-if="item === items[3]">
                    {{ $root.lang().global.nyi }}
                  </div>
                </v-tab-item>
              </v-tabs-items>
            </div>
          </div>
        </template>
      </v-card>

    </v-dialog>
  `,
  props: {
    value: {
      type: Boolean,
      required: true
    },
    textureID: {
      type: String,
      required: true
    },
    textureObj: {
      type: Object,
      required: true
    },
    contributors: {
      type: Object,
      required: true
    },
    onClose: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      resolutions: ['16x', ...settings.resolutions],
      tab: null,
      items: [
        this.$root.lang().gallery.modal.items.information,
        this.$root.lang().gallery.modal.items.authors,
        this.$root.lang().gallery.modal.items.animated,
        this.$root.lang().gallery.modal.items.model
      ],
      infos: ["texture", "uses", "paths"],
      authors: settings.resolutions,
      opened: false,
    }
  },
  watch: {
    value: {
      handler(n) {
        this.opened = n
      },
      immediate: true
    },
    opened(n) {
      this.$emit('input', n);
    }
  },
  methods: {
    closeModal: function() {
      this.onClose()
      this.opened = false
    },
    discordIDtoName(d) {
      return this.contributors[d] 
        ? this.contributors[d].username 
          ? this.contributors[d].username
          : this.$root.lang().gallery.error_message.user_anonymous
        : this.$root.lang().gallery.error_message.user_not_found
    },
    timestampToDate(t) {
      const a = new Date(t)
      return moment(a).format('ll')
    },
    getItems(item) {
      let output = []


      switch (item) {
        case this.authors[0]:
        case this.authors[1]:
          return this.textureObj.contributions
            .filter(el => el.resolution === parseInt(item, 10))
            .map(el => ({
              date: this.timestampToDate(el.date),
              contributors: el.authors.map(el => this.discordIDtoName(el)).join(',\n')
            }))

        case this.infos[0]:
          return [this.textureObj[item]]
        case this.infos[1]:
          return Object.values(this.textureObj[item])

        case this.infos[2]:
          this.textureObj[item].forEach(paths => {
            paths.forEach(path => output.push(path))
          })

          return output
      }
    },
    getHeaders(item) {
      switch (item) {
        case this.authors[0]:
        case this.authors[1]:
          return [
            {
              text: this.$root.lang().gallery.modal.tabs.date,
              value: "date"
            },
            {
              text: this.$root.lang().gallery.modal.tabs.authors,
              value: "contributors"
            }
          ]
        case this.infos[0]:
          return [
            {
              text: this.$root.lang().gallery.modal.tabs.id,
              value: 'id',
              sortable: false
            },
            {
              text: this.$root.lang().gallery.modal.tabs.name,
              value: 'name',
              sortable: false
            },
            {
              text: this.$root.lang().gallery.modal.tabs.tags,
              value: 'type',
              sortable: false
            }
          ]
        case this.infos[1]:
          return [
            {
              text: this.$root.lang().gallery.modal.tabs.use_id,
              value: 'id'
            },
            {
              text: this.$root.lang().gallery.modal.tabs.use_name,
              value: 'textureUseName'
            },
            {
              text: this.$root.lang().gallery.modal.tabs.editions,
              value: 'editions'
            },
            {
              text: this.$root.lang().gallery.modal.tabs.texture_id,
              value: 'textureID'
            }
          ]

        case this.infos[2]:
          return [
            {
              text: this.$root.lang().gallery.modal.tabs.path_id,
              value: 'id'
            },
            {
              text: this.$root.lang().gallery.modal.tabs.resource_pack_path,
              value: 'path'
            },
            {
              text: this.$root.lang().gallery.modal.tabs.mc_versions,
              value: 'versions'
            },
            {
              text: this.$root.lang().gallery.modal.tabs.use_id,
              value: 'useID'
            }
          ]
      }


    },
    getTextureURL(res) {
      const path = this.textureObj.paths[0][0]

      // todo: use settings here
      switch (path.path.startsWith('assets')) {
        case false:
          if (res === '16x') return `https://raw.githubusercontent.com/CompliBot/Default-Bedrock/${path.versions[0]}/${path.path}`
          return `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-Bedrock-${res}/${path.versions[0]}/${path.path}`

        default:
          if (res === '16x') return `https://raw.githubusercontent.com/CompliBot/Default-Java/${path.versions[0]}/${path.path}`
          return `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-Java-${res}/${path.versions[0]}/${path.path}`
      }
    },
    ucfirst(text) {
      return text[0].toUpperCase() + text.substring(1)
    },
  },
  computed: {
    infosText: function () {
      return {
        texture: this.ucfirst(this.$root.lang().gallery.modal.infos.texture),
        uses: this.ucfirst(this.$root.lang().gallery.modal.infos.uses),
        paths: this.ucfirst(this.$root.lang().gallery.modal.infos.paths),
      }
    },
  }
}