/* global Vue, axios, marked */
const UserList = () => import('./userlist.js')
const ImagePreviewer = () => import('./image-previewer.js')

export default {
  name: 'addon-form',
  components: {
    UserList,
    ImagePreviewer
  },
  props: {
    newAddon: {
      type: Boolean,
      required: true
    },
    value: {
      required: true,
    },
    addon: {
      type: Object,
      required: false,
      default: {
        name: '',
        description: '',
        authors: [],
        slug: '',
        options: {
          optifine: false,
          comments: true,
          tags: []
        },
        approval: {
          status: 'pending',
          author: null,
          reason: null
        },
        files: {
          header: {}
        }
      }
    }
  },
  template: `
  <v-container>
    <v-list class="my-2" rounded two-line color="rgba(255,255,255,.05)">
      <v-form lazy-validation v-model="validForm" ref="form" style="padding: 10px">

        <div class="container">
          <div class="row">
            <!-- LEFT PART : INPUT -->
            <div class="col">
              <div class="text-h5">{{ $root.lang().addons.general.title }}</div>
              <!-- Addon name -->
              <v-text-field
                clearable
                v-model="addon.name"
                :rules="form.name.rules"
                :counter="form.name.counter.max"
                :label="$root.lang().addons.general.name.label"
                :hint="$root.lang().addons.general.name.hint"
              />

              <div class="pt-5">
                <v-file-input
                  dense
                  show-size
                  small-chips
                  counter="1"
                  prepend-icon="mdi-image"
                  v-model="headerFile"
                  accept="image/jpg, image/png, image/gif"
                  :label="$root.lang().addons.images.header.labels.drop"
                  :rules="headerRules"
                  :on-error="o => $root.showSnackBar(o.message, o.colour)"
                />
              </div>
            </div>
            <!-- RIGHT PART: HEADER IMAGE PREVIEW -->
            <div class="col-12 col-sm-3 d-flex align-center" v-if="hasHeader">
              <v-img
                style="border-radius: 10px"
                :aspect-ratio="16/9"
                :src="header"
              />
            </div>
          </div>

          <!-- upload field for images -->
          <ImagePreviewer :sources="carouselSources" @item-delete="onDeleteCarousel" />

          <div class="pt-5">
            <v-file-input
              dense
              show-size
              multiple
              small-chips
              prepend-icon="mdi-image"
              v-model="carouselFiles"
              accept="image/jpg, image/png, image/gif"
              :label="$root.lang().addons.images.carousel.labels.drop"
              :rules="carouselRules"
              :on-error="o => $root.showSnackBar(o.message, o.colour)"
            />
          </div>

        <div class="text-h5">{{ $root.lang().addons.titles.details }}</div>

        <!-- Addon description -->
        <v-textarea
          clearable
          v-model="addon.description"
          :rules="form.description.rules"
          :counter="form.description.counter.max"
          :label="$root.lang().addons.general.description.label"
          :hint="$root.lang().addons.general.description.hint"
        />

        <!-- Addon description preview -->
        <v-container
          v-if="addon.description && addon.description.length > 0"
          class="markdown"
          style="background-color: rgba(33,33,33,1); border-radius: 5px;"
          v-html="$root.compiledMarkdown(addon.description)"
        />

        <!-- Addon authors selection -->
        <user-list 
          :array="addon.authors"
          :label="$root.lang().addons.general.authors.label"
          :hint="$root.lang().addons.general.authors.hint"
        />

        <div class="container">
          <div class="row text-center">
            <div class="col-6">
              <v-row>
                <v-checkbox
                  class="col-6"
                  v-for="type in editions"
                  v-model="selectedEditions"
                  :label="type"
                  :disabled="selectedEditions.length === 1 && selectedEditions[0] === type"
                  :value="type"
                  color="primary"
                />
              </v-row>
            </div><div class="col-6">
              <v-row>
                <v-checkbox
                  class="col-6"
                  v-for="type in res"
                  v-model="selectedRes"
                  :label="type"
                  :disabled="selectedRes.length === 1 && selectedRes[0] === type"
                  :value="type"
                  color="primary"
                />
              </v-row>
            </div>
          </div>
        </div>

        <div class="text-h5">{{ $root.lang().addons.options.title }}</div>

        <div class="container">
          <v-row>
              <v-checkbox
                class="col-6"
                :v-model="comments"
                :label="$root.lang().addons.options.comments.label"
                color="primary"
              />
              <v-checkbox
                class="col-6"
                :v-model="optifine"
                :label="$root.lang().addons.options.optifine.label"
                color="primary"
              />
          </v-row>
        </div>

        <div class="text-h5">{{ $root.lang().addons.downloads.title }}</div>

        <div class="container">
          <div class="v-row">
            <!-- LEFT PART: Download link -->
            <div class="v-col">
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
            </div>
            <!-- RIGHT PART: INFORMATION -->
            <div class="v-col">

            </div>
          </div>
        </div>        

        <div class="text-center">
          <v-btn :disabled="!validForm">
            {{ $root.lang().global.btn.submit }}
          </v-btn>
        </div>
      </v-form>
    </v-list>
  </v-container>
  `,
  data() {
    return {
      form: {
        files: {
          header: {
            rules: [
              header => !!header || this.$root.lang().addons.images.header.rules.image_required,
              header => (header && header.size < this.form.files.header.counter.max) || this.$root.lang().addons.images.header.rules.image_size.replace('%s', this.form.files.header.counter.max / 10000)
            ],
            counter: {
              max: 5000000
            }
          },
          carousel: {
            rules: []
          },
          value: ''
        },
        description: {
          rules: [
            desc => !!desc || this.$root.lang().addons.general.description.rules.description_required,
            desc => (desc && desc.length <= this.form.description.counter.max) || this.$root.lang().addons.general.description.rules.description_too_big.replace('%s', this.form.description.counter.max),
            desc => (desc && desc.length >= this.form.description.counter.min) || this.$root.lang().addons.general.description.rules.description_too_small.replace('%s', this.form.description.counter.min),
          ],
          counter: {
            min: 256,
            max: 4096
          }
        },
        name: {
          rules: [
            name => !!name || this.$root.lang().addons.general.name.rules.name_required,
            name => (name && name.length <= this.form.name.counter.max) || this.$root.lang().addons.general.name.rules.name_too_big.replace('%s', this.form.name.counter.max),
            name => (name && name.length >= this.form.name.counter.min) || this.$root.lang().addons.general.name.rules.name_too_small.replace('%s', this.form.name.counter.min),
            // TODO: REDO name => (name && !this.names.includes(name)) || this.$root.lang().addons.general.name.rules.name_unavailable
          ],
          counter: {
            min: 5,
            max: 30
          },
        },
        slug: {
          rules: [
            input => !!input || this.$root.lang().addons.general.slug.rules.required,
            input => (input && input.length <= this.form.slug.counter.max) || this.$root.lang().addons.general.slug.rules.too_big.replace('%s', this.form.slug.counter.max),
            input => (input && input.length >= this.form.slug.counter.min) || this.$root.lang().addons.general.slug.rules.too_small.replace('%s', this.form.slug.counter.min),
            input => /^[a-zA-Z0-9\-]+$/.test(input) || this.$root.lang().addons.general.slug.rules.incorrect_format
          ],
          counter: {
            min: 5,
            max: 30
          },
        }
      },
      headerFile: undefined,
      headerValid: false,
      headerValidating: false,
      headerError: "",
      carouselFiles: undefined,
      carouselValid: false,
      carouselValidating: false,
      carouselError: "",
      carouselDoNotVerify: false,
      downloads: [{
        key: '',
        links: ['']
      }],
      downloadTitleRules: [
        u => !!u || this.$root.lang().addons.downloads.name.rules.name_required,
        u => u !== ' ' || this.$root.lang().addons.downloads.name.rules.name_cannot_be_empty
      ],
      downloadLinkRules: [
        u => this.validURL(u) || this.$root.lang().addons.downloads.link.rule
      ],
      validForm: false,
      editions: ['Java', 'Bedrock'],
      selectedEditions: ['Java'],
      res: ['32x', '64x'],
      selectedRes: ['32x'],
      comments: true,
      optifine: false
    }
  },
  computed: {
    hasHeader: function () {
      return !!this.header
    },
    header: function () {
      return this.newAddon ? (this.headerFile ? URL.createObjectURL(this.headerFile) : undefined) : this.addon.files.header.source
    },
    carouselSources: function() {
      return this.carouselValidating === false && this.carouselValid ? this.carouselFiles.map(file => URL.createObjectURL(file)) : []
    },
    headerValidSentence: function() {
      if(this.headerValidating) {
        return "Header being verified..."
      } else if(this.headerValid) {
        return true
      }

      return this.headerError
    },
    headerRules: function() {
      return [...this.form.files.header.rules, this.headerValidSentence]
    },
    carouselRules: function() {
      return [...this.form.files.carousel.rules, this.carouselValidSentence]
    },
    carouselValidSentence: function() {
      if(this.carouselValidating) {
        return "Carousel being verified..."
      } else if(this.carouselValid) {
        return true
      }

      return this.carouselError
    },
    submittedData: function() {
      return {
        title: this.addon.title,
        headerImage: this.headerFile,
        carouselFiles: this.carouselFiles,
        description: this.addon.description,
        authors: this.addon.authors,
        download: this.addon.downloads,
        tags: [...selectedEditions, ...selectedRes]
      }
    }
  },
  methods: {
    addNewDownload: function () {
      this.downloads.push({ key: '', links: [''] })
    },
    updateDownloadForm: function () {
      this.addon.downloads = {}

      this.downloads.forEach(download => {
        this.addon.downloads[download.key] = download.links
      })
    },
    checkSlug: function() {
      return new Promise((resolve, reject) => {
        const slug = this.addon.slug
        axios.get('/addons/slug/' + slug)
          .then(() => {
            reject(new Error(this.$root.lang().addon.general.slug.rules.unavailable))
          })
          .catch(err => {
            if(err.status === 404) resolve()
            else {
              const message = (err && err.response && err.response.dara ? err.response.data.error : undefined) || 'An error occured'
              console.error(err)
              reject(message)
            }
          })
      })
    },
    onDeleteCarousel: function(item, index) {
      this.carouselDoNotVerify = true
      this.carouselFiles.splice(index, 1)
      Vue.nextTick(() => {
        this.carouselDoNotVerify = false
      })
    },
    validateRatio: function(ctx) {
      const ratio = (ctx.width / ctx.height).toFixed(2) == 1.78
      if(!ratio) throw new Error(this.$root.lang().addons.images.header.rules.image_ratio)
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
    verifyImage: function(file, validateImage) {
      if(validateImage === undefined) validateImage = this.validateRatio

      return new Promise((resolve, reject) => {
          // start reader
          const reader = new FileReader()
    
          reader.onload = function (e) {
            const image = new Image()
            image.src = e.target.result
            image.onload = function () {
              try {
                validateImage(this)
                resolve()
              } catch (error) {
                reject(error)
              }
            }
            image.onerror = function(error) {
              reject(e)
            }
          }
          reader.onerror = function(error) {
            reject(e)
          }
    
          // set file to be readt
          reader.readAsDataURL(file)
      })
    }
  },
  watch: {
    headerFile(file) {
      // activate validation loading
      this.headerValidating = true

      this.verifyImage(file, this.validateRatio)
        .then(() => {
          this.headerValid = true
        })
        .catch((error) => {
          this.headerValid = false
          this.headerError = error.message
          that.$root.showSnackBar(error.message, 'error')
        })
        .finally(() => {
          this.headerValidating = false
        })
    },
    carouselFiles(files) {
      if(this.carouselDoNotVerify) return

      this.carouselValidating = true
      Promise.all(files.map(f => this.verifyImage(f, this.validateRatio)))
      .then(() => {
        this.carouselValid = true
      })
      .catch((error) => {
        this.carouselValid = false
        this.carouselError = error.message
        this.$root.showSnackBar(error.message, 'error')
      })
      .finally(() => {
        this.carouselValidating = false
      })
    }
  }
}