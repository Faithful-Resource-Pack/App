/* global axios, Vue */

const ModalInformation = () => import('./information.js');

export default {
  name: "texture-modal",
  components: {
    ModalInformation,
  },
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
          
          <template v-if="!loading">
            <v-toolbar-title>[#{{ data.texture.id }}] {{ data.texture.name }}</v-toolbar-title>
          
            <v-spacer></v-spacer>

            <v-btn icon @click="() => $parent.copyShareLink(data.id)">
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </template>
          <template v-else>
            <v-toolbar-title>{{ $root.lang().global.loading }}</v-toolbar-title>
          </template>

          <template v-slot:extension>
            <v-tabs align-with-title v-model="tab">
              <v-tab style="text-transform: uppercase">{{ $root.lang().gallery.modal.items.information }}</v-tab>
              <v-tab style="text-transform: uppercase">{{ $root.lang().gallery.modal.items.authors }}</v-tab>
              <v-tab style="text-transform: uppercase">{{ $root.lang().gallery.modal.items.model }}</v-tab>
            </v-tabs>
          </template>
        </v-toolbar>

        <template v-if="!loading">
          <ModalInformation v-if="tab == 0" :data="data"></ModalInformation>
        </template>
        <!-- <template v-if="Object.keys(data).length > 0">

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
        </template> -->
      </v-card>

    </v-dialog>
  `,
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    receivedData: {
      type: Object,
      required: true,
    },
    contributors: {
      type: Object,
      required: true,
    },
    onClose: {
      type: Function,
      default: () => {},
    },
    opened: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      tab: null,
      loading: true,
      data: {},
    };
  },
  watch: {
    value: {
      handler(n) {
        this.opened = n;
      },
      immediate: true,
    },
    opened(n) {
      this.$emit("input", n);

      // if true === opened, fetch data
      if (n) {
        axios
          .get(`${this.$root.apiURL}/gallery/modal/${this.receivedData.id}/${this.receivedData.options.versions.current}`)
          .then((res) => {
            this.data = {
              ...this.receivedData,
              ...res.data,
            };

            this.loading = false;
            console.log(this.data)
          });
      }
    },
  },
  methods: {
    closeModal: function () {
      this.onClose();
      this.opened = false;
      this.loading = true;
    },
  },
};
