/* global axios, Vue, Prism */

const useModal = () => import('./modal_use.js')
const removeConfirm = () => import('./remove-confirm.js')

const emptyPath = function () {
  return ['', []]
}

const emptyUse = function () {
  return {
    name: '',
    editions: [],
    paths: [emptyPath()]
  }
}

const emptyTexture = function () {
  return {
    name: '',
    type: [],
    uses: [emptyUse()]
  }
}

export default {
  name: 'add-multiple-texture-modal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    disableDialog: {
      type: Function,
      required: true
    },
    types: {
      type: Array,
      required: false,
      default: function () { return [] }
    },
    versions: {
      type: Array,
      required: false,
      default: function () { return [] }
    },
    editions: {
      type: Array,
      required: false,
      default: function () { return [] }
    }
  },
  template: `
  <v-dialog
      v-model="dialog"
      persistent
      max-width="860"
    >      
      <v-card>
        <v-card-title class="headline">{{ $root.lang().database.titles.add_textures }}</v-card-title>
        <v-card-text class="pb-0">
          <v-row>
            <v-col class="col-12" sm="12">
              <v-form ref="form">
                <v-expansion-panels flat v-model="panel">
                  <v-expansion-panel>
                    <v-expansion-panel-header class="px-0 py-0"><h2 class="title">{{ $root.lang().database.subtitles.import_json_data }}</h2></v-expansion-panel-header>
                    <v-expansion-panel-content class="mx-n6">
                      <prism-editor class="ma-0 my-editor fixed-height mb-2" v-model="formData.importjson" :highlight="highlighter" line-numbers></prism-editor>
                      <v-btn block @click="parseJSON">{{ $root.lang().database.labels.parse_json }}</v-btn>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <h2 class="title my-2">{{ $root.lang().database.subtitles.add_manually }}</h2>
                <v-container fluid class="pa-0" v-for="(texture, t_i) in textures" :key="'tex-' + t_i">
                  <v-row dense>
                    <v-col><v-text-field class="mb-1" v-model="texture.name" :placeholder="$root.lang().database.labels.texture_name" hide-details dense clearable /></v-col>
                    <v-col><v-select class="mb-1" v-model="texture.type" :items="types" :placeholder="$root.lang().database.labels.texture_type" multiple hide-details dense clearable small-chips /></v-col>
                    <v-col class="flex-grow-0 flex-shrink-0"><v-icon color="error" @click="() => deleteTexture(t_i)">mdi-close</v-icon></v-col>
                  </v-row>
                  <v-row dense class="mb-2">
                    <v-col class="flex-grow-0 flex-shrink-0">
                      <h3 class="ma-0 mt-1">{{ $root.lang().database.subtitles.uses }}</h3>
                      <v-btn x-small @click="() => addNewUse(t_i)">{{ $root.lang().global.btn.add }}</v-btn>
                    </v-col>
                    <v-col>
                      <v-container fluid class="pa-0" v-for="(use, u_i) in texture.uses" :key="'tex-' + t_i + '-use-' + u_i">
                        <v-row dense>
                          <v-col><v-text-field class="mb-1" v-model="use.name" :placeholder="$root.lang().database.labels.use_name" hide-details dense clearable /></v-col>
                          <v-col><v-select class="mb-1" :items="editions" v-model="use.editions[0]" :placeholder="$root.lang().database.labels.use_edition" hide-details dense clearable /></v-col>
                          <v-col class="flex-grow-0 flex-shrink-0"><v-icon color="error" @click="() => deleteUse(t_i, u_i)">mdi-close</v-icon></v-col>
                        </v-row>
                        <v-row dense class="mb-2">
                          <v-col class="flex-grow-0 flex-shrink-0">
                            <h3 class="ma-0">{{ $root.lang().database.subtitles.paths }}</h3>
                            <v-btn x-small class="mt-2" @click="() => addNewPath(t_i, u_i)">{{ $root.lang().global.btn.add }}</v-btn>
                          </v-col>
                          <v-col>
                            <v-container class="pa-0" fluid v-for="(path, p_i) in use.paths" :key="'tex-' + t_i + '-use-' + u_i + '-p_i-' + p_i">
                              <v-row dense>
                                <v-col><v-text-field class="mb-0" v-model="path[0]" :placeholder="$root.lang().database.labels.path" hide-details dense clearable /></v-col>
                                <v-col><v-select class="mb-0" :items="versions" v-model="path[1]" :placeholder="$root.lang().database.labels.versions" multiple hide-details dense clearable small-chips /></v-col>
                                <v-col class="flex-grow-0 flex-shrink-0"><v-icon color="error" @click="() => deletePath(t_i, u_i, p_i)">mdi-close</v-icon></v-col>
                              </v-row>
                            </v-container>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-col>
                  </v-row>
                </v-container>
                <v-btn x-small @click="addNewTexture">{{ $root.lang().database.labels.add_new_texture }}</v-btn>
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
  data () {
    return {
      panel: undefined,
      formData: {
        importjson: '[]'
      },
      textures: [emptyTexture()]
    }
  },
  methods: {
    highlighter (code) {
      // js highlight example
      return Prism.highlight(code, Prism.languages.js, 'json')
    },
    addNewTexture: function () {
      this.textures.push(emptyTexture())
    },
    addNewUse: function (textureIndex) {
      this.textures[textureIndex].uses.push(emptyUse())
    },
    addNewPath: function (textureIndex, useIndex) {
      this.textures[textureIndex].uses[useIndex].paths.push(emptyPath())
    },
    deleteTexture: function (textureIndex) {
      this.textures.splice(textureIndex, 1)
    },
    deleteUse: function (textureIndex, useIndex) {
      this.textures[textureIndex].uses.splice(useIndex, 1)
    },
    deletePath: function (textureIndex, useIndex, pathIndex) {
      this.textures[textureIndex].uses[useIndex].paths.splice(pathIndex, 1)
    },
    versionsLeft: function (textureIndex, useIndex) {
      const otherUseIndex = 1 - useIndex
      let result = this.editions

      const otherEditions = this.textures[textureIndex].uses[otherUseIndex].editions
      if (otherEditions.length > 0 && this.editions.include(otherEditions[0])) {
        result = this.editions.splice(this.editions.indexOf(otherEditions[0]), 1)
      }
      return result
    },
    verify: function (value) {
      const schema = textureSchema(this.types, this.editions, this.versions)

      single(value, schema)

      return value
    },
    verifyJSON: function () {
      return this.verify(JSON.parse(this.formData.importjson))
    },
    parseJSON: function () {
      try {
        const data = this.verifyJSON()
        this.textures = data
      } catch (err) {
        console.error(err)
        this.$root.showSnackBar(`${err.message}`, 'error')
      }
    },
    send: function () {
      const data = JSON.parse(JSON.stringify(this.textures))
      axios.post('/textures/add', {
        token: this.$root.user.access_token,
        data: data
      })
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().database.labels.add_textures_success, 'success')
        })
        .catch(err => {
          console.error(err)
          this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
        })
    }
  },
  watch: {
    dialog: function (newValue, oldValue) {
      if (oldValue !== newValue && newValue === true) {
        Vue.nextTick(() => {
          this.textures = [emptyTexture()]
          this.$refs.form.reset()
        })
      }
    }
  }
}
