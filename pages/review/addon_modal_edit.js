/* global axios, Vue, FileReader, Image */

export default {
  name: 'addon-edit-modal',
  template: `
    <v-dialog
      v-model="dialog"
      persistent
      max-width="900"
      style="z-index: 10000"
    >
      <v-card>  
        <v-card-title class="headline" v-text="addon.title" />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-form ref="form">

                <v-textarea
                  :rules="descriptionRules"
                  :counter="descriptionMaxLength"
                  clearable
                  v-model="addon.description"
                  :label="$root.lang().addons.general.description.label"
                  :hint="$root.lang().addons.general.description.hint"
                ></v-textarea>

                <v-container class="text--secondary" style="margin-bottom: 10px; background-color: rgb(66,66,66); border-radius: 5px" v-html="$root.compiledMarkdown(addon.description)"></v-container>

                <v-autocomplete
                  v-model="addon.authors"
                  :items="contributors"
                  :loading="contributors.length == 0"
                  item-text="username"
                  item-value="id"
                  :label="$root.lang().addons.general.authors.label"
                  :hint="$root.lang().addons.general.authors.hint"
                  multiple
                  chips
                >
                  <!-- SELECTED THINGY -->
                  <template v-slot:selection="data">
                    <v-chip
                      :key="data.item.id"
                      v-bind="data.attrs"
                      :input-value="data.selected"
                      :disabled="data.disabled"
                      close
                      @click:close="removeAuthor(data.item.id)"
                    >
                      <v-avatar
                        :class="{ accent: data.item.uuid == undefined, 'text--white': true }"
                        left
                      >
                        <template v-if="data.item.uuid != undefined">
                          <v-img eager
                            :src="'https://visage.surgeplay.com/face/24/' + data.item.uuid"
                            :alt="data.item.username.slice(0, 1).toUpperCase()"
                          />
                        </template>
                        <template v-else>
                          {{ data.item.username.slice(0, 1) }}
                        </template>
                      </v-avatar>
                      {{ data.item.username }}
                    </v-chip>
                  </template>

                  <!-- LIST ITEM PART -->
                  <template v-slot:item="data">
                    <template v-if="typeof data.item !== 'object'">
                      <v-list-item-content v-text="data.item"></v-list-item-content>
                    </template>
                    <template v-else>
                      <v-list-item-content>
                        <v-list-item-title v-text="data.item.username"></v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-avatar :style="{ 'background': data.item.uuid ? 'transparent' : '#4e4e4e' }">
                        <template v-if="data.item.uuid">
                          <v-img eager :src="'https://visage.surgeplay.com/head/48/' + data.item.uuid" />
                        </template>
                        <div v-else>{{ data.item.username.slice(0, 1).toUpperCase() }}</div>
                      </v-list-item-avatar>
                    </template>
                  </template>
                </v-autocomplete>

                <div v-if="addon.images?.header" style="margin: 10px;">
                <v-img
                  style="border-radius: 10px"
                  :aspect-ratio="16/9"
                  :src="addon.images.header"
                />
                </div>

                <v-file-input
                  chips
                  show-size
                  counter="1"
                  accept="image/jpeg, image/png, image/gif"
                  small-chips
                  :label="$root.lang().addons.images.header.labels.replace"
                  :rules="headerImageRules"
                  prepend-icon="mdi-image"
                  v-model="header_img"
                  @change="validateHeader"
                ></v-file-input>

                <v-row v-if="addon.images?.carousel.length > 0" style="margin: -2px">
                  <v-col
                    v-for="index in addon.images.carousel"
                    :key="index"
                    :cols="$vuetify.breakpoint.mdAndUp ? 4 : 6"
                    style="margin-bottom: -28px"
                  >
                    <v-img
                      style="border-radius: 10px"
                      :aspect-ratio="16/9"
                      :src="index"
                    />
                    <v-btn
                      @click="removeCarouselImage(index)"
                      small
                      color="white"
                      icon

                      style="position: relative; bottom: calc(100% - 32px); left: calc(100% - 32px);"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>

                <v-file-input
                  chips
                  multiple
                  show-size
                  accept="image/jpeg, image/png, image/gif"
                  small-chips
                  :label="$root.lang().addons.images.carousel.labels.replace"
                  prepend-icon="mdi-image-multiple"
                  v-model="carousel_img"
                  @change="validateCarousel"
                ></v-file-input>

                <v-checkbox
                  class="transparent-input"
                  v-model="addon.comments"
                  :label="$root.lang().addons.options.comments.label"
                ></v-checkbox>

                <v-checkbox
                  class="transparent-input"
                  v-model="addon.optifine"
                  :label="$root.lang().addons.options.optifine.label"
                ></v-checkbox>

                <v-row>
                  <v-col>
                    <v-select
                      multiple
                      small-chips
                      v-model="selectedEditions"
                      :items="editions"
                      :label="$root.lang().addons.options.editions.label"
                      :rules="editionsRules"
                      @change="validateType"
                    ></v-select>
                  </v-col>

                  <v-col>
                    <v-select
                      multiple
                      small-chips
                      v-model="selectedRes"
                      :items="res"
                      :label="$root.lang().addons.options.resolutions.label"
                      :rules="resRules"
                      @change="validateType"
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row
                  v-for="(obj, index) in downloads"
                  :key="index"
                  :style="{'margin-top': index == 0 ? '-12px' : '-32px' }"
                >
                  <v-col cols="3">
                    <v-text-field
                      clearable
                      :placeholder="$root.lang().addons.downloads.name.placeholder"
                      :label="$root.lang().addons.downloads.name.label"
                      v-model="obj.key"
                      :rules="downloadTitleRules"
                      @change="updateDownloadForm()"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="9">
                    <v-row
                      v-for="(link, indexLinks) in obj.links"
                      :key="indexLinks"
                      :style="{
                        'align-items': 'baseline',
                        'margin-top': indexLinks != 0 ? '-32px' : '-12px'
                      }"
                    >
                      <v-col :cols="index == 0 ? 11 : 10">
                        <v-text-field
                          clearable
                          :placeholder="$root.lang().addons.downloads.link.placeholder"
                          :label="$root.lang().addons.downloads.link.label"
                          v-model="obj.links[indexLinks]"
                          :rules="downloadLinkRules"
                          @change="updateDownloadForm()"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="1" v-if="indexLinks == 0" style="padding-left: 3px;">
                        <v-btn icon @click="addLink(index)"">
                          <v-icon color="white lighten-1">mdi-plus</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col cols="1" v-else style="padding-left: 3px;">
                        <v-btn icon @click="deleteLink(index, indexLinks)"">
                          <v-icon color="red lighten-1">mdi-minus</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col cols="1" v-if="index != 0 && indexLinks == 0" style="padding-left: 3px;">
                        <v-btn icon @click="deleteDownload(index)"">
                          <v-icon color="red lighten-1">mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-btn block @click="addNewDownload()">
                      {{ $root.lang().global.btn.add_download }} <v-icon color="white lighten-1">mdi-plus</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="disableDialog"
          >
            {{ $root.lang().global.btn.cancel }}
          </v-btn>
          <v-btn
            color="yellow darken-1"
            :disabled="everythingIsOk() || submitted"
            text
            @click="send"
          >
            <template v-if="submitted">
              <v-progress-circular
                indeterminate
              />
            </template>
            {{ !submitted ? $root.lang().global.btn.save : '' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    
    </v-dialog>
  `,
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    disableDialog: {
      type: Function,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    resAvailable: {
      type: Array,
      required: false,
      default: function () { return ['Java', 'Bedrock'] }
    },
    editionAvailable: {
      type: Array,
      required: false,
      default: function () { return ['32x', '64x'] }
    },
    contributors: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      addon: {
        title: '',
        description: '',
        authors: [],
        comments: true,
        images: {
          header: '',
          carousel: []
        },
        optifine: false,
        type: [],
        downloads: {}
      },
      header_img: undefined,
      carousel_img: [],
      descriptionMaxLength: 4096,
      descriptionRules: [
        u => !!u || this.$root.lang().addons.general.description.rules.description_required,
        u => (u && u.length <= this.descriptionMaxLength) || this.$root.lang().addons.general.description.rules.description_too_big.replace('%s', this.descriptionMaxLength)
      ],
      headerImageRules: [
        u => (!u || u?.size < 500000) || this.$root.lang().addons.images.header.rules.image_size.replace('%s', 500)
      ],
      editions: ['Java', 'Bedrock'],
      selectedEditions: [],
      editionsRules: [
        u => (u && u.length > 0) || this.$root.lang().addons.options.editions.rule
      ],
      res: ['32x', '64x'],
      selectedRes: [],
      resRules: [
        u => (u && u.length > 0) || this.$root.lang().addons.options.resolutions.rule
      ],
      downloadTitleRules: [
        u => !!u || this.$root.lang().addons.downloads.name.rules.name_required,
        u => u !== ' ' || this.$root.lang().addons.downloads.name.rules.name_cannot_be_empty
      ],
      downloadLinkRules: [
        u => this.validURL(u) || this.$root.lang().addons.downloads.link.rule
      ],
      downloads: [
        {
          key: '',
          links: ['']
        }
      ],
      submitted: false
    }
  },
  methods: {
    send: function () {
      if (!this.$root.isUserLogged) return

      this.submitted = true
      const data = {
        data: JSON.parse(JSON.stringify(this.addon)),
        token: this.$root.user.access_token
      }

      axios.post('/addons/edit', data)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.disableDialog()
          this.submitted = false
          this.$forceUpdate()
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
          this.submitted = false
        })
    },
    everythingIsOk: function () {
      let downloadsAreValid = true
      this.downloads.forEach(download => {
        if (download.key === '') downloadsAreValid = false

        download.links.forEach(link => {
          if (link === '' || !this.validURL(link)) downloadsAreValid = false
        })
      })

      return !(
        this.addon.description !== '' && this.addon.description.length <= this.descriptionMaxLength &&
        this.addon.authors.length !== 0 &&
        this.addon.images.header !== '' &&
        this.addon.type.length > 1 &&
        Object.keys(this.addon.downloads).length !== 0 && downloadsAreValid
      )
    },
    removeAuthor: function (authorID) {
      this.addon.authors = this.addon.authors.filter(id => id != authorID)
    },
    addNewDownload: function () {
      this.downloads.push({ key: '', links: [''] })
    },
    deleteLink: function (index, indexLink) {
      this.downloads[index].links.splice(indexLink, 1)
      this.updateDownloadForm()
    },
    addLink: function (index) {
      this.downloads[index].links.push('')
      this.updateDownloadForm()
    },
    deleteDownload: function (index) {
      this.downloads.splice(index, 1)
      this.updateDownloadForm()
      this.$forceUpdate()
    },
    updateDownloadForm: function () {
      this.addon.downloads = {}

      this.downloads.forEach(download => {
        this.addon.downloads[download.key] = download.links
      })
    },
    removeCarouselImage: function (el) {
      // using el to get the index, the index change if you delete one element of the array
      const index = this.addon.images.carousel.indexOf(el)
      this.addon.images.carousel.splice(index, 1)
      this.carousel_img.splice(index, 1)
    },
    validateType: function () {
      this.addon.type = [...this.selectedEditions, ...this.selectedRes]
    },
    validateHeader: function () {
      if (!this.header_img) {
        this.addon.images.header = ''
        return
      }

      const that = this
      const reader = new FileReader()
      reader.onload = function (e) {
        const image = new Image()
        image.src = e.target.result

        image.onload = function () {
          // 'this' refer to the image and 'that' to Vue
          if ((this.width / this.height).toFixed(2) === 1.78) {
            that.addon.images.header = e.target.result
            that.$forceUpdate()
          } else {
            that.$root.showSnackBar(this.$root.lang().addons.images.header.rules.image_ratio, 'error')
            that.header_img = undefined
          }
        }
      }
      reader.readAsDataURL(this.header_img)
    },
    validateCarousel: function () {
      this.addon.images.carousel = []

      if (this.carousel_img.length === 0) return

      const that = this
      this.carousel_img.forEach(file => {
        const reader = new FileReader()

        reader.onload = function (e) {
          const image = new Image()
          image.src = e.target.result

          image.onload = function () {
            // 'this' refer to the image and 'that' to Vue
            if ((this.width / this.height).toFixed(2) === 1.78) {
              that.addon.images.carousel.push(e.target.result)
              that.$forceUpdate()
            } else {
              that.carousel_img.splice(that.carousel_img.indexOf(file), 1)
              that.$root.showSnackBar(this.lang.addons.images.carousel.rule, 'error')
              that.$forceUpdate()
            }
          }
        }

        reader.readAsDataURL(file)
      })
    },
    validURL: function (str) {
      const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
      return !!pattern.test(str)
    }
  },
  watch: {
    dialog: function (newValue, oldValue) {
      if (oldValue !== newValue && newValue === true) {
        Vue.nextTick(() => {
          this.addon = this.data

          this.selectedRes = []
          this.selectedEditions = []
          this.downloads = []

          for (const key in this.addon.downloads) {
            this.downloads.push({
              key: key,
              links: this.addon.downloads[key]
            })
          }

          this.addon.type.forEach(type => {
            if (this.res.includes(type)) this.selectedRes.push(type)
            if (this.editions.includes(type)) this.selectedEditions.push(type)
          })
        })
      }
    }
  }
}
