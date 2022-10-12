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
      content-class="colored"
      max-width="600"
    >
      <use-modal :color="color" :subDialog="subDialogOpen" :disableSubDialog="disableSubDialog" :add="Object.keys(subDialogData).length == 0" :textureID="formData.id" :usesLength="Object.keys(formData.uses).length" :data="subDialogData"></use-modal>
      <remove-confirm type="use" :confirm="remove.confirm" :disableDialog="closeAndUpdate" :data="remove.data"></remove-confirm>
      
      <v-card>
        <v-card-title class="headline" v-text="dialogTitle"></v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field :color="color" :hint="'⚠️' + $root.lang().database.hints.texture_id" required :readonly="add == false" v-model="formData.id" :label="$root.lang().database.labels.texture_id"></v-text-field>
            <v-text-field :color="color" required clearable v-model="formData.name" :label="$root.lang().database.labels.texture_name"></v-text-field>
            <v-select :color="color" :item-color="color" required multiple deletable-chips small-chips v-model="formData.type" :items="types" :label="$root.lang().database.labels.texture_type"></v-select>

            <h2 class="title">{{ $root.lang().database.subtitles.uses }}</h2>
            <v-list v-if="Object.keys(formData.uses).length" :label="$root.lang().database.labels.texture_uses">
              <v-list-item
                class="list-item-inline"
                v-for="(use, index) in formData.uses"
                :key="index"
              >
                <v-list-item-avatar tile :class="[color, textColor]" :style="{ 'padding': '0 10px 0 10px', 'border-radius': '4px !important', width: 'auto' }" >#{{ index }}</v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-list-item style="display: inline; padding: 0 0 0 5px;">
                      <template v-if="use.textureUseName">{{ use.textureUseName }}</template>
                      <template v-else><i>{{ $root.lang().database.labels.nameless }}</i></template>
                    </v-list-item>
                    <v-list-item-subtitle style="display: block; padding: 0 0 0 5px;"  v-text="(use.editions||[]).join(', ')"></v-list-item-subtitle>
                  </v-list-item-title>
                </v-list-item-content>

                <v-list-item-action class="merged">
                  <v-btn icon @click="openSubDialog(use)">
                    <v-icon color="lighten-1">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon @click="askRemoveUse(use)">
                    <v-icon color="red lighten-1">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else>{{ $root.lang().database.labels.no_use_found }}</div>

            <v-btn block :style="{ 'margin-top': '10px' }" color="secondary" @click="openSubDialog()">{{ $root.lang().database.labels.add_new_use }} <v-icon right>mdi-plus</v-icon></v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="disableDialog"
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
    },
    color: {
      type: String,
      required: false,
      default: 'primary'
    },
    textColor: {
      type: String,
      required: false,
      default: ''
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
    dialogTitle: function () {
      return this.add ? this.$root.lang().database.titles.add_texture : this.$root.lang().database.titles.change_texture
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
    send: function () {
      if (!this.$root.isUserLogged) return
      const data = JSON.parse(JSON.stringify(this.formData))
      data.token = this.$root.user.access_token

      axios.post(`/textures/${this.add ? 'add' : 'change'}`, data)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.disableDialog(true)
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(err, 'error')
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
    dialog: function (newValue, oldValue) {
      if (newValue === true) {
        Vue.nextTick(() => {
          if (this.add) this.$refs.form.reset()

          if (!this.add) {
            this.formData.name = this.data.name
            this.formData.type = this.data.type
            this.formData.id = this.data.id
            this.getUses(this.data.id)
          }
        })
      } else {
        // Fixes bug where click outside changes dialog to false but not dialogOpen to false
        this.disableDialog()
      }
    }
  }
}
