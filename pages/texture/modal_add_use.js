/* global axios, TwinBcrypt, Vue */

export default {
  name: 'add-use-modal',
  template: `
  <v-dialog
    v-model="subDialog"
    persistent
    max-width="600"
  >
  
    <v-card>
      <v-card-title class="headline" v-text="subDialogTitle"></v-card-title>
      <v-card-text>
        <v-row>
          <v-col :class="'col-12'" :sm="12">
            <v-form ref="form" lazy-validation>
            <v-text-field hint="changing the ID can break everything" required :readonly="add == false" v-model="subFormData.id" label="Use ID"></v-text-field>

              <v-text-field required clearable v-model="subFormData.textureID" label="Texture ID"></v-text-field>

              <v-select required v-model="subFormData.editions" :items="editions" label="Texture Edition"></v-select>

              <v-list v-if="Object.keys(subFormData.paths).length" label="Texture Paths">
              </v-list>
              <div v-else>No paths found for this texture.</div>

              <v-btn block :style="{ 'margin-top': '10px' }" color="secondary" @click="openSubDialog()">Add new Path <v-icon right dark>mdi-plus</v-icon></v-btn>

            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-1"
          text
          @click="disableSubDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="darken-1"
          text
          @click="send"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>`,
  props: {
    subDialog: {
      type: Boolean,
      required: true
    },
    disableSubDialog: {
      type: Function,
      required: true
    },
    add: {
      type: Boolean,
      required: false,
      default: false
    },
    data: {
      type: Object,
      required: true
    },
    editions: {
      type: Array,
      required: false,
      default: function () { return [ 'java', 'bedrock', 'dungeons' ] }
    }
  },
  computed: {
    subDialogTitle: function () {
      return `${this.add ? 'Add new' : 'Change'} use`
    }
  },
  data() {
    return {
      subFormData: {
        editions: [],
        id: '',
        textureID: -1,
        textureUseName: '',
        paths: {}
      }
    }
  },
  methods: {
    send: function () {
      const data = JSON.parse(JSON.stringify(this.formData))

      axios.post(`${this.add ? '/uses/add' : '/uses/change'}`, data)
      .then(() => {
        this.$root.showSnackBar('Ended successfully', 'success')
        this.disableDialog(true)
      })
      .catch(err => {
        console.error(err)
        this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
      })
    },
  },
  watch: {
    dialog: function (newValue, oldValue) {
      if (oldValue != newValue && newValue == true) {
        Vue.nextTick(() => {
          this.$refs.form.reset()

          if (!this.add) {
            this.formData.editions = this.data.editions
            this.formData.id = this.data.id
            this.formData.textureID = this.data.textureID
            this.formData.textureUseName = this.data.textureUseName
            // this.getPaths(this.data.id)
          }
        })
      }
    }
  }
}