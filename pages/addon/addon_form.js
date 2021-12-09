/* global Vue, axios, marked */
const UserList = () => import('./userlist.js')
const Upload = () => import('./upload.js')

export default {
  name: 'addon-form',
  components: {
    UserList,
    Upload
  },
  props: {
    names: {
      type: Array,
      required: true
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
      <v-form ref="form" v-if="names.length > 0" style="padding: 10px">
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

        <div class="text-h5">{{ $root.lang().addons.images.title }}</div>

        <!-- Addon header display -->
        <template v-if="hasHeader()">
          <v-img
            style="border-radius: 10px; margin: 10px"
            :aspect-ratio="16/9"
            :src="getHeader()"
          />
        </template>

        <upload
          dense
          show-size
          small-chips
          counter="1"
          prepend-icon="mdi-image"
          v-model="form.header"
          accept="image/jpg, image/png, image/gif"
          :label="$root.lang().addons.images.header.labels.drop"
          :rules="form.files.header.rules"
          :on-error="o => $root.showSnackBar(o.message, o.colour)"
          @change="validateHeader"
        />

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
              header => (header && header.size < this.form.files.header.counter.max) || this.$root.lang().images.header.rules.image_size.replace('%s', this.form.files.header.counter.max / 10000)
            ],
            counter: {
              max: 5000000
            }
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
            name => (name && !this.names.includes(name)) || this.$root.lang().addons.general.name.rules.name_unavailable
          ],
          counter: {
            min: 5,
            max: 30
          },
        }
      },
    }
  },
  methods: {
    hasHeader: function () {
      if (Object.values(this.addon.files.header).length > 0) return true
      return false
    },
    getHeader: function () {
      return this.addon.files.header.source
    },
    validateHeader: function () {
      if (!this.form.files.header.value) {
        this.addon.files.header = {}
        return
      }

      const that = this
      const reader = new FileReader()
      reader.onload = function (e) {
        const image = new Image()
        image.src = e.target.result
        image.onload = function () {
          if ((this.width / this.height).toFixed(2) == 1.78) {
            that.addon.files.header = {
              source: e.target.result
            }
          } else {
            that.$root.showSnackBar(that.$root.lang().addons.images.header.rules.image_ratio, 'error')
            that.form.header = undefined
          }

          that.$forceUpdate()
          console.log(that.addon.files.header, that.form.files.header.value)
        }
      }

      reader.readAsDataURL(this.form.files.header.value)
    }
  },
}