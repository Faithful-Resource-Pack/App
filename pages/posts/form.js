/* global Vue, axios, marked */

const FullscreenPreview = () => import('../addon/fullscreen-preview.js')
const DateField = () => import('./datefield.js')
const DownloadList = () => import('./downloadlist.js')

export default {
  name: 'post-form',
  props: {
    isNew: {
      type: Boolean,
      required: false,
      default: () => false
    },
    incomingData: {
      required: true
    }
  },
  components: {
    'fullscreen-preview': FullscreenPreview,
    DateField,
    DownloadList
  },
  template: `
  <v-container>
    <fullscreen-preview
      v-if="!loading"
      ref="headerPreview"
      :src="submittedForm.headerImg"
    />

    <div class="text-center" v-if="loading && !isNew">
      <h2 v-text="$root.lang('posts.form.title.loading_post')" class="mb-3"></h2>
      <v-progress-circular
        :size="70"
        :width="7"
        color="blue"
        indeterminate
      ></v-progress-circular>
    </div>

    <v-list v-if="!loading" :class="['main-container', 'my-2', {'mx-n3': !$vuetify.breakpoint.mdAndUp }]" :rounded="$vuetify.breakpoint.mdAndUp" two-line>
      <v-form lazy-validation v-model="validForm" ref="form" style="padding: 0 6px">

        <div class="container">
          <div>
            <v-btn class="float-right" prepend-icon="mdi-refresh" v-on:click="askReset">
              <v-icon left>mdi-refresh</v-icon>
              {{ $root.lang('posts.form.buttons.reset') }}
            </v-btn>
            <div class="text-h5 mb-4">{{ $root.lang('posts.form.title.general') }}</div>
          </div>
          <div class="row">
            <!-- LEFT PART : INPUT -->
            <div class="col pb-0">              
              <v-text-field
                required
                clearable
                v-model="submittedForm.title"
                :rules="form.title.rules"
                :label="$root.lang('posts.form.title.label')"
                :hint="$root.lang('posts.form.title.hint')"
              />

              <v-text-field
                required
                clearable
                v-model="submittedForm.permalink"
                :label="$root.lang('posts.form.permalink.label')"
                :hint="$root.lang('posts.form.permalink.hint')"
              />

              <v-text-field
                required
                clearable
                v-model="submittedForm.headerImg"
                :rules="form.headerImg.rules"
                :label="$root.lang('posts.form.headerImg.label')"
                :hint="$root.lang('posts.form.headerImg.hint')"
              />
            </div>

            <!-- RIGHT PART: HEADER IMAGE PREVIEW -->
            <div class="col-12 col-sm-3 d-flex px-0 pt-0 align-center" v-if="hasHeader">
              <div class="col">
                <div style="position: relative">
                  <v-img
                    @click.stop="(e) => $refs.headerPreview.open()"
                    style="border-radius: 10px"
                    :aspect-ratio="16/9"
                    :src="submittedForm.headerImg"
                  />
                  <v-card class="ma-2" rounded style="display: inline-block; position: absolute; right: 0; top: 0;">
                    <v-icon small class="ma-1" @click.stop="(e) => $refs.headerPreview.open()">
                      mdi-fullscreen
                    </v-icon><v-icon small class="ma-1" @click="submittedForm.headerImg = ''">
                      mdi-delete
                    </v-icon>
                  </v-card>
                </div>
              </div>
            </div>
          </div>

          <div class="text-h5 mb-4">{{ $root.lang('posts.form.description.title') }}</div>

          <v-textarea
            clearable
            v-model="submittedForm.description"
            rows="10"
            :label="$root.lang('posts.form.description.label')"
            :hint="$root.lang('posts.form.description.hint')"
          />

          <!-- Description preview -->
          <v-expansion-panels :value="0" flat class="dense my-4"
            v-if="submittedForm.description && submittedForm.description.length > 0"
          ><v-expansion-panel>
            <v-expansion-panel-header>{{ $root.lang('posts.form.description.render') }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-container
                id="description-preview"
                class="markdown pa-0 bg-transparent"
                v-html="$root.compiledMarkdown(submittedForm.description)"
              />
            </v-expansion-panel-content>
          </v-expansion-panel></v-expansion-panels>

          <div class="text-h5 mb-4 mt-4">{{ $root.lang('posts.form.details.title') }}</div>

          <div class="container">
            <v-row class="align-center">
                <div class="col-12 col-md-6">
                  <v-checkbox
                    v-model="submittedForm.published"
                    :label="$root.lang('posts.form.published.label')"
                    color="primary"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <DateField
                    class="mb-0"
                    required
                    v-model="submittedForm.date"
                    :invalid-message="$root.lang('posts.form.date.invalid')"
                    :label="$root.lang('posts.form.date.label')"
                    :hint="$root.lang('posts.form.date.hint')"
                  />
                </div>
            </v-row>
          </div>

          <div class="text-h5 mb-4">{{ $root.lang('posts.form.changelog.title') }}</div>

          <v-textarea
            clearable
            v-model="changelogArea"
            rows="20"
            :label="$root.lang('posts.form.changelog.label')"
            :hint="$root.lang('posts.form.changelog.hint')"
            @change="handleChangelog"
            spellcheck="false"
            :rules="changelogRules"
            class="mb-0 small-textarea"
          />

          <v-expansion-panels flat class="dense my-4"><v-expansion-panel>
            <v-expansion-panel-header>{{ $root.lang('posts.form.changelog.render') }}</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-container
                id="description-preview"
                class="markdown pa-0 bg-transparent json"
                >
                <pre class="pa-2">{{ JSON.stringify(submittedForm.changelog, null, 2) }}</pre>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel></v-expansion-panels>
          
          <div class="text-h5 mt-0 mb-4">{{ $root.lang('addons.downloads.title') }}</div>

          <DownloadList
            v-model="submittedForm.downloads"
            :rulesName="downloadTitleRules"
            :rulesURL="downloadLinkRules"
          />

          <div class="text-center mt-4">
            <v-btn smaall :disabled="!validForm" @click="() => onSubmit(false)" color="primary">
              {{ $root.lang('global.btn.submit') }}
            </v-btn>
          </div>
		    </div>
      </v-form>
    </v-list>
  </v-container>
  `,
  data() {
    return {
      loading: true,
      changelogArea: "",
      form: {
        headerImg: {
          rules: [u => this.validURL(u) || this.$root.lang().addons.downloads.link.rule]
        },
        description: {
          rules: [desc => !!desc || this.$root.lang('addons.general.description.rules.description_required')]
        },
        title: {
          rules: [name => !!name || this.$root.lang('addons.general.name.rules.name_required')]
        }
      },
      submittedForm: undefined,
      downloadTitleRules: [
        u => !!u || this.$root.lang().addons.downloads.name.rules.name_required,
        u => u.trim() !== '' || this.$root.lang().addons.downloads.name.rules.name_cannot_be_empty
      ],
      downloadLinkRules: [u => this.validURL(u) || this.$root.lang().addons.downloads.link.rule],
      validForm: false,
      changelogRules: [u => this.validateChangelog(u)]
    }
  },
  watch: {
    incomingData: {
      handler: function (n) {
        if (!n) return
        this.setFormData(n)
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    hasHeader: function () {
      return !!(this.submittedForm?.headerImg)
    },
    header: function () {
      return this.addonNew ?
        (this.headerValidating == false && this.headerValid && this.submittedForm.headerFile ?
          URL.createObjectURL(this.submittedForm.headerFile) : undefined) :
        (this.headerSource ? this.headerSource : undefined)
    },
    headerValidSentence: function () {
      if (this.headerValidating) {
        return "Header being verified..."
      } else if (this.headerValid) {
        return true
      }

      return this.headerError
    },
    headerRules: function () {
      if (!this.addonNew) return []
      return [...this.form.files.header.rules, this.headerValidSentence]
    }
  },
  methods: {
    askReset: function () {
      this.$emit('reset')
    },
    setFormData: function (data) {
      const parsed = JSON.parse(JSON.stringify(data))
      this.submittedForm = parsed
      this.setChangelog(parsed ? (parsed.changelog || '') : '')

      if (this.$refs.form)
        this.$refs.form.validate()
      this.loading = false
    },
    setChangelog: function (v) {
      this.changelogArea = this.parseChangelog(v, 0)
    },
    parseChangelog: function (obj, index = 0) {
      const NEWLINE = '\n';
      const spaces = Array(index * 2).fill(' ').join('');
      if (Array.isArray(obj)) {
        if (obj.length === 0) return NEWLINE;
        return obj.map(s => this.parseChangelog(s, index)).join(NEWLINE);
      }
      else if (typeof (obj) === 'object') {
        return Object.entries(obj).map(([key, values]) => (
          `${spaces}- ${key}:\n${this.parseChangelog(values, index + 1)}`
        )).join(NEWLINE)
      }
      else if (typeof (obj) === 'string') {
        return `${spaces}- ${obj}`;
      }

      return NEWLINE;
    },
    onSubmit: function () {
      const valid = this.$refs.form.validate()
      if (!valid) return

      this.$emit('submit', this.submittedForm)
    },
    validateRatio: function (ctx) {
      const ratio = (ctx.width / ctx.height).toFixed(2) == 1.78
      if (!ratio) throw new Error(this.$root.lang().addons.images.header.rules.image_ratio)
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
    verifyImage: function (file, validateImage) {
      if (validateImage === undefined) validateImage = this.validateRatio

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
          image.onerror = function (error) {
            reject(e)
          }
        }
        reader.onerror = function (error) {
          reject(e)
        }

        // set file to be readt
        reader.readAsDataURL(file)
      })
    },
    unmapChangelog: function (val) {
      let error // = undefined
      let res // = undefined

      let data = val.split('\n').map(s => {
        const ends_with_colon = s.trim().endsWith(':')

        if (!ends_with_colon) {
          const first_index_dash = s.indexOf("-");
          if (first_index_dash !== -1) {
            // add " and escape []
            s = s.substring(0, first_index_dash) + s.substring(first_index_dash).replace(/(-\s?)/, '$1"') + '"'
          }
        }
        return s
      }).join('\n')

      try {
        res = jsyaml.load(data)
        if (!res) error = new Error("Failed to parse YAML")
      } catch (err) {
        error = err
      }

      // transform array of object as object with keys
      res = this.objectArrayToObject(res)

      return [error, res]
    },
    objectArrayToObject: function (val) {
      let isObjectArray = Array.isArray(val) && val.reduce((acc, cur) => acc && typeof (cur) === 'object', true)
      if (isObjectArray) {
        return val.reduce((acc, cur) => {
          let res = acc

          Object.entries(cur).forEach(([key, v]) => {
            res[key] = this.objectArrayToObject(v)
          })

          return acc
        }, {})
      } else if (Array.isArray(val)) {
        return val.map(v => this.objectArrayToObject(v))
      } else {
        return val
      }
    },
    validateChangelog: function (val) {
      const lines = val.split('\n').map(s => s.trim())
      let good = true
      let i = 0
      while (i < lines.length && good) {
        good = lines[i].startsWith('- ')
        i++
      }

      if (good) good = !this.unmapChangelog(val)[0]

      if (!good)
        return this.$root.lang("posts.form.changelog.invalid")

      return true
    },
    handleChangelog: function (v) {
      const [err, res] = this.unmapChangelog(v)

      if (err) {
        this.$root.showSnackBar(err, 'error')
        return
      }

      this.submittedForm.changelog = res

      return
    }
  }
}