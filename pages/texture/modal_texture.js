/* global axios, Vue */

const useModal = () => import('./modal_use.js')
const removeConfirm = () => import('./remove-confirm.js')

export default {
  name: 'texture-modal',
  components: {
    useModal,
    removeConfirm
  },
  template: `
  <v-dialog
      v-model="dialog"
      persistent
      max-width="600"
    >
      <use-modal :subDialog="subDialogOpen" :disableSubDialog="disableSubDialog" :add="Object.keys(subDialogData).length == 0" :textureID="formData.id" :usesLength="Object.keys(formData.uses).length" :data="subDialogData"></use-modal>
      <remove-confirm type="use" :confirm="remove.confirm" :disableDialog="closeAndUpdate" :data="remove.data"></remove-confirm>
      
      <v-card>
        <v-card-title class="headline" v-text="dialogTitle"></v-card-title>
        <v-card-text>
          <v-row>
            <v-col class="col-12" sm="12">
              <v-form ref="form">
                <v-text-field hint="⚠️ Changing the ID can break everything" required :readonly="add == false" v-model="formData.id" label="Texture ID"></v-text-field>
                <v-text-field required clearable v-model="formData.name" label="Texture Name"></v-text-field>
                <v-select required multiple small-chips v-model="formData.type" :items="types" label="Texture Types"></v-select>

                <h2 class="title" >Uses</h2>
                <v-list v-if="Object.keys(formData.uses).length" label="Texture Uses">
                  <v-row>
                  <v-list-item
                    v-for="(use, index) in formData.uses"
                    :key="index"
                  >

                  <v-list-item-content :style="{ 'display': 'contents' }">
                    <v-list-item-avatar tile :style="{ 'background': 'rgba(255,255,255,0.5)', 'max-width': 'fit-content', 'padding': '0 10px 0 10px', 'border-radius': '4px !important' }" >#{{ index }}</v-list-item-avatar>
                    <v-list-item-title>
                      <v-list-item :style="{ 'display': 'contents' }" v-if="use.textureUseName">{{ use.textureUseName}}</v-list-item>
                      <v-list-item :style="{ 'display': 'contents' }" v-else><i>Nameless</i></v-list-item>
                      <v-list-item-subtitle v-text="(use.editions||[]).join(', ')"></v-list-item-subtitle>
                    </v-list-item-title>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-btn icon @click="openSubDialog(use)">
                      <v-icon color="white lighten-1">mdi-pencil</v-icon>
                    </v-btn>
                  </v-list-item-action>
                  <v-list-item-action>
                    <v-btn icon @click="askRemoveUse(use)">
                      <v-icon color="red lighten-1">mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>

                  </v-list-item>
                  </v-row>
                </v-list>
                <div v-else>No uses found for this texture.</div>

                <v-btn block :style="{ 'margin-top': '10px' }" color="secondary" @click="openSubDialog()">Add new Use <v-icon right dark>mdi-plus</v-icon></v-btn>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="disableDialog"
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
    add: {
      type: Boolean,
      required: false,
      default: false
    },
    data: {
      type: Object,
      required: true
    },
    types: {
      type: Array,
      required: false,
      default: function () { return [] }
    }
  },
  data () {
    return {
      formData: {
        name: '',
        type: [],
        id: '',
        uses: {}
      },
      subDialogOpen: false,
      subDialogData: {},
      remove: {
        confirm: false,
        data: {}
      }
    }
  },
  computed: {
    dialogTitle: function() {
      return `${this.add ? 'Add a new' : 'Edit'} texture`
    }
  },
  methods: {
    openSubDialog: function (data = {}) {
      this.subDialogOpen = true
      this.subDialogData = data
    },
    disableSubDialog: function () {
      this.subDialogOpen = false
      this.getUses(this.formData.id)
      this.$forceUpdate()
    },
    closeAndUpdate: function () {
      this.remove.confirm = false
      this.getUses(this.formData.id)
      this.$forceUpdate()
    },
    send: function() {
      if (!this.$root.isUserLogged) return
      const data = JSON.parse(JSON.stringify(this.formData))

      axios.post(`/textures/${this.add ? 'add' : 'change' }`, data)
        .then(() => {
          this.$root.showSnackBar('Ended successfully', 'success')
          this.disableDialog(true)
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    },
    getUses: function (textureID) {
      axios.get('/uses/search', {
        params: {
          textureID: textureID
        }
      })
      .then((res) => {
        const temp = res.data
        this.formData.uses = {}

        for (let i = 0; i < temp.length; i++) {
          this.formData.uses[temp[i].id] = temp[i]
        }
      })
      .catch(function (err) {
        console.error(err)
      })
    },
    askRemoveUse: function (data) {
      this.remove.data = data
      this.remove.confirm = true
    }
  },
  watch: {
    dialog: function(newValue, oldValue) {
      if (oldValue != newValue && newValue == true) {
        Vue.nextTick(() => {
          if (this.add) this.$refs.form.reset()

          if (!this.add) {
            this.formData.name = this.data.name
            this.formData.type = this.data.type
            this.formData.id = this.data.id
            this.getUses(this.data.id)
          }
          
        })
      }
    }
  }
}