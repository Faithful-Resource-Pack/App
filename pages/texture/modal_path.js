/* global axios, Vue */

export default {
  name: 'path-modal',
  template: `
  <v-dialog
    v-model="subPathDialog"
    content-class="colored"
    max-width="600"
  >
    <v-card>
      <v-card-title class="headline" v-text="subPathDialogTitle"></v-card-title>
      <v-card-text>
        <v-row>
          <v-col class="col-12" :sm="12">
            <v-form ref="form">
              <v-text-field :color="color" v-if="add == false" :hint="'⚠️' + $root.lang().database.hints.path_id" v-model="subPathFormData.id" :label="$root.lang().database.labels.path_id"></v-text-field>
              <v-text-field :color="color" v-if="add == false" :hint="'⚠️' + $root.lang().database.hints.use_id" v-model="subPathFormData.useID" :label="$root.lang().database.labels.use_id"></v-text-field>
              <v-text-field :color="color" :hint="$root.lang().database.hints.path" v-model="subPathFormData.path" :label="$root.lang().database.labels.path"></v-text-field>
              <v-select     :color="color" :item-color="color" required multiple small-chips v-model="subPathFormData.versions" :items="sortedVersions" :label="$root.lang().database.labels.versions"></v-select>
              <v-checkbox   :color="color" v-model="subPathFormData.mcmeta" :label="$root.lang().database.labels.mcmeta" />
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="red darken-1"
          text
          @click="disableSubPathDialog"
        >
          {{ $root.lang().global.btn.cancel }}
        </v-btn>
        <v-btn
          color="darken-1"
          text
          @click="send"
        >
          {{ $root.lang().global.btn.save }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>`,
  props: {
    subPathDialog: {
      type: Boolean,
      required: true
    },
    disableSubPathDialog: {
      type: Function,
      required: true
    },
    add: {
      type: Boolean,
      required: false,
      default: false
    },
    pathData: {
      type: Object,
      required: true
    },
    versions: {
      type: Array,
      required: false,
      default: function () {
        return [...settings.versions.java, ...settings.versions.bedrock, ...settings.versions.dungeons]
      }
    },
    useID: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: false,
      default: 'primary'
    }
  },
  data() {
    return {
      // those var names does not make any sens anymore lmao
      subPathFormData: {
        id: '',
        useID: '',
        path: '',
        versions: [],
        mcmeta: false
      }
    }
  },
  computed: {
    subPathDialogTitle: function () {
      return this.add ? this.$root.lang().database.titles.add_path : this.$root.lang().database.titles.change_path
    },
    sortedVersions: function () {
      return this.versions.sort(this.MinecraftSorter)
    }
  },
  methods: {
    MinecraftSorter: function (a, b) {
      const aSplit = a.split('.').map(s => parseInt(s))
      const bSplit = b.split('.').map(s => parseInt(s))

      if (aSplit.includes(NaN) || bSplit.includes(NaN)) {
        return String(a).localeCompare(String(b)) // compare as strings
      }

      const upper = Math.min(aSplit.length, bSplit.length)
      let i = 0
      let result = 0
      while (i < upper && result == 0) {
        result = (aSplit[i] == bSplit[i]) ? 0 : (aSplit[i] < bSplit[i] ? -1 : 1) // each number
        ++i
      }

      if (result != 0) return result

      result = (aSplit.length == bSplit.length) ? 0 : (aSplit.length < bSplit.length ? -1 : 1) // longer length wins

      return result
    },
    send: function () {
      const newData = JSON.parse(JSON.stringify(this.subPathFormData))
      newData.token = this.$root.user.access_token

      if (this.add) newData.useID = this.useID

      axios.post(`/paths/${this.add ? 'add' : 'change'}`, newData)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.disableSubPathDialog(true)
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(err, 'error')
        })
    }
  },
  watch: {
    subPathDialog: function () {
      Vue.nextTick(() => {
        if (!this.add) {
          this.subPathFormData.versions = this.pathData.versions.sort(this.MinecraftSorter)
          this.subPathFormData.id = this.pathData.id
          this.subPathFormData.path = this.pathData.path
          this.subPathFormData.useID = this.pathData.useID
          this.subPathFormData.mcmeta = this.pathData.mcmeta
        } else this.$refs.form.reset()
      })
    }
  }
}
