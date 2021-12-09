/* global axios, marked, FileReader, Image */
const upload = () => import('./upload.js')

export default {
  name: 'new-addon-page',
  components: {
    upload
  },
  template: `
  <v-container>
    <h1>Submitting new Add-ons is currently disabled for maintenance.</h1>
    <!--
    <div class="text-h4 py-4">
      {{ $root.lang().addons.titles.submit }}
      <v-progress-circular
        v-if="titles.length == 0"
        indeterminate
      />
    </div>
    <div class="my-2">
      <v-list rounded v-if="titles.length > 0" two-line color="rgba(255, 255, 255, 0.05)">
        <v-list-item>
          <v-row>
            <v-col>
              <v-form ref="form" lazy-validation>

                <div class="text-h5">{{ $root.lang().addons.general.title }}</div>
                <v-text-field
                  :rules="titleRules"
                  :counter="titleMaxLength"
                  clearable
                  v-model="form.title"
                  :label="$root.lang().addons.general.addon_title.label"
                  :hint="$root.lang().addons.general.addon_title.hint"
                ></v-text-field>

                <v-textarea
                  :rules="descriptionRules"
                  :counter="descriptionMaxLength"
                  clearable
                  v-model="form.description"
                  :label="$root.lang().addons.general.description.label"
                  :hint="$root.lang().addons.general.description.hint"
                ></v-textarea>
                <v-container v-if="form.description != null && form.description.length != 0" class="markdown" style="background-color: rgb(33,33,33); border-radius: 5px" v-html="$root.compiledMarkdown(form.description)">
                </v-container>
                <br>

                <v-autocomplete
                  v-model="form.authors"
                  :items="contributors"
                  :loading="contributors.length == 0"
                  item-text="username"
                  item-value="id"
                  :label="$root.lang().addons.general.authors.label"
                  :hint="$root.lang().addons.general.authors.hint"
                  multiple
                  chips
                >
                  SELECTED THINGY
                  <template v-slot:selection="data">
                    <v-chip
                      :key="data.item.id"
                      v-bind="data.attrs"
                      :input-value="data.selected"
                      :disabled="data.disabled"
                      close
                      @click:close="remove(data.item.id)"
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

                  LIST ITEM PART
                  <template v-slot:item="data">
                    <template v-if="data.item && data.item.contructor && data.item.constructor.name === 'String'">
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

              </v-form>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item>
          <v-row>
            <v-col>
              <v-form>
                <div class="text-h5">{{ $root.lang().addons.images.title }}</div>

                <div v-if="form.images && form.images.header" style="margin: 10px;">
                <v-img
                  style="border-radius: 10px"
                  :aspect-ratio="16/9"
                  :src="form.images.header"
                />
                </div>

                <upload
                  show-size
                  counter="1"
                  accept="image/jpeg, image/png, image/gif"
                  small-chips
                  :label="$root.lang().addons.images.header.labels.drop"
                  :rules="headerImageRules"
                  prepend-icon="mdi-image"
                  v-model="header_img"
                  @change="validateHeader"
                  :on-error="o => $root.showSnackBar(o.message, o.colour)"
                  dense
                ></upload>

                <v-row v-if="form.images.carousel.length > 0" style="margin: -2px">
                  <v-col 
                    v-for="index in form.images.carousel" 
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
                
                <upload
                  multiple
                  show-size
                  accept="image/jpeg, image/png, image/gif"
                  small-chips
                  :label="$root.lang().addons.images.carousel.labels.drop"
                  prepend-icon="mdi-image-multiple"
                  v-model="carousel_img"
                  @change="validateCarousel"
                  :on-error="o => $root.showSnackBar(o.message, o.colour)"
                  dense
                ></upload>
              </v-form>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item>
          <v-row>
            <v-col>
              <v-form>
                <div class="text-h5">Options</div>

                <v-checkbox
                  class="transparent-input"
                  v-model="form.comments"
                  :label="$root.lang().addons.options.comments.label"
                ></v-checkbox>

                <v-checkbox
                  class="transparent-input"
                  v-model="form.optifine"
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

              </v-form>
            </v-col>
          </v-row>
        </v-list-item>
        <v-list-item
          style="margin-bottom: 50px"
        >
          <v-row>
            <v-col>
              <v-form>
                <div class="text-h5">{{ $root.lang().addons.downloads.title }}</div>

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
                        <v-btn icon @click="addLink(index)">
                          <v-icon color="white lighten-1">mdi-plus</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col cols="1" v-else style="padding-left: 3px;">
                        <v-btn icon @click="deleteLink(index, indexLinks)">
                          <v-icon color="red lighten-1">mdi-minus</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col cols="1" v-if="index != 0 && indexLinks == 0" style="padding-left: 3px;">
                        <v-btn icon @click="deleteDownload(index)">
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
        </v-list-item>
        <div :style="{'display': 'flex', 'justify-content': 'center'}">
          <v-btn
            @click="send"
            :disabled="everythingIsOk() || submitted"
          >
            <template v-if="submitted">
              <v-progress-circular
                indeterminate
              />
            </template>
            {{ !submitted ? $root.lang().global.btn.submit : '' }}
          </v-btn>
        </div>
      </v-list>
    </div>
    -->
  </v-container>
  `,
  data() {
    return {
      titleMaxLength: 24,
      titles: [],
      titleRules: [
        u => !!u || this.$root.lang().addons.general.addon_title.rules.title_required,
        u => (u && u.length <= this.titleMaxLength) || this.$root.lang().addons.general.addon_title.rules.title_too_big.replace('%s', this.titleMaxLength),
        u => (u && this.isTitleAvailable(u)) || this.$root.lang().addons.general.addon_title.rules.title_unavailable
      ],
      descriptionMaxLength: 4096,
      descriptionRules: [
        u => !!u || this.$root.lang().addons.general.description.rules.description_required,
        u => (u && u.length <= this.descriptionMaxLength) || this.$root.lang().addons.general.description.rules.description_too_big.replace('%s', this.descriptionMaxLength)
      ],
      headerImageRules: [
        u => !!u || this.$root.lang().addons.images.header.rules.image_required,
        u => (u && u.size < 500000) || this.$root.lang().addons.images.header.rules.image_size.replace('%s', 500)
      ],
      editions: settings.editions,
      selectedEditions: [],
      editionsRules: [
        u => (u && u.length > 0) || this.$root.lang().addons.options.editions.rule
      ],
      res: settings.resolutions,
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
      contributors: [],
      form: {
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
      header_img: '',
      carousel_img: [],
      downloads: [
        {
          key: '',
          links: ['']
        }
      ],
      addons: {},
      submitted: false
    }
  },
  methods: {
    send: function () {
      if (!this.$root.isUserLogged) return

      this.submitted = true
      const data = {
        data: JSON.parse(JSON.stringify(this.form)),
        token: this.$root.user.access_token
      }

      axios.post('/addons/submit', data)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.$router.push('submissions')
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    },
    isTitleAvailable: function (title) {
      if (title === '') return true
      if (this.titles.includes(title)) return false
      return true
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
        this.form.title !== '' && this.form.title !== null && this.form.title.length <= this.titleMaxLength && this.isTitleAvailable(this.form.title) &&
        this.form.description !== '' && this.form.description !== null && this.form.description.length <= this.descriptionMaxLength &&
        this.form.authors.length !== 0 && this.form.authors.includes(this.$root.user.id) &&
        this.form.images.header !== '' &&
        this.form.type.length > 1 &&
        Object.keys(this.form.downloads).length !== 0 && downloadsAreValid
      )
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
      this.form.downloads = {}

      this.downloads.forEach(download => {
        this.form.downloads[download.key] = download.links
      })
    },
    removeCarouselImage: function (el) {
      // using el to get the index, the index change if you delete one element of the array
      const index = this.form.images.carousel.indexOf(el)
      this.form.images.carousel.splice(index, 1)
      this.carousel_img.splice(index, 1)
    },
    validateType: function () {
      this.form.type = [...this.selectedEditions, ...this.selectedRes]
    },
    validateHeader: function () {
      if (!this.header_img) {
        this.form.images.header = ''
        return
      }

      const that = this
      const reader = new FileReader()
      reader.onload = function (e) {
        const image = new Image()
        image.src = e.target.result

        image.onload = function () {
          // 'this' refer to the image and 'that' to Vue
          if ((this.width / this.height).toFixed(2) == 1.78) {
            that.form.images.header = e.target.result
            that.$forceUpdate()
          } else {
            that.$root.showSnackBar(that.$root.lang().addons.images.header.rules.image_ratio, 'error')
            that.header_img = undefined
          }
        }
      }
      reader.readAsDataURL(this.header_img)
    },
    validateCarousel: function () {
      this.form.images.carousel = []

      if (this.carousel_img.length === 0) return

      const that = this
      this.carousel_img.forEach(file => {
        const reader = new FileReader()

        reader.onload = function (e) {
          const image = new Image()
          image.src = e.target.result

          image.onload = function () {
            // 'this' refer to the image and 'that' to Vue
            if ((this.width / this.height).toFixed(2) == 1.78) {
              that.form.images.carousel.push(e.target.result)
              that.$forceUpdate()
            } else {
              that.carousel_img.splice(that.carousel_img.indexOf(file), 1)
              that.$root.showSnackBar('Wrong Ratio: Image(s) with non 16:9 ratio have been removed.', 'error')
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
    },
    getAuthors: function () {
      axios.get('/contributors/all/')
        .then(res => {
          this.contributors = res.data
          this.$forceUpdate()
        })
        .catch(err => {
          console.trace(err)
        })
    },
    getAddonsTitle: function () {
      axios.get('/addons/get/titles')
        .then(res => {
          this.titles = []
          for (const addon in res.data) {
            this.titles.push(res.data[addon].title)
          }
          this.$forceUpdate()
        })
        .catch(err => {
          console.trace(err)
        })
    },
    remove: function (id) {
      const index = this.form.authors.indexOf(id)
      if (index >= 0) this.form.authors.splice(index, 1)
    }
  },
  mounted: function () {
    this.getAuthors()
    this.getAddonsTitle()
    this.form.authors = [this.$root.user.id]
  }
}
