/* global axios */

export default {
  name: 'modpacks-new-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">
      Submit a Modpack
    </div>
      
    <div class="my-2 text-h5">
      <v-list rounded two-line style="background-color: rgba(255,255,255,.05)">
        <v-list-item>
          <v-list-item-content style="margin-bottom: -16px">
            <v-text-field
              v-model="curseforgeURL"
              clearable
              label="Paste the modpack URL here"
            >
            </v-text-field>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              :disabled="curseforgeURL === '' || curseforgeURL === null || (curseforgeURL !== null && !curseforgeURL.startsWith('https://www.curseforge.com/minecraft/modpacks/'))"
              @click="fetchModpack"
            >
              Fetch
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="Object.keys(modpack).length">
          <v-list-item-avatar style="border-radius: 2px">
            <v-img
              :src="modpack.thumbnail"
            ></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ modpack.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ modpack.summary }}</v-list-item-subtitle>
          </v-list-item-content>

          
        </v-list-item>
      </v-list>

      <br>

      <v-list rounded two-line v-if="Object.keys(modpack).length" style="background-color: rgba(255,255,255,.05)">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Status:</v-list-item-title>
            <v-list-item-subtitle>{{ status }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <br> 


    </div>
  </v-container>
  `,
  data() {
    return {
      curseforgeURL: '',
      manifest: {},
      modpack: {},
      form: {
        id: '',
        url: '',
        name: '',
        author: '',
        mods: [],
        version: '',
        minecraft: ''
      },
      status: ''
    }
  },
  methods: {
    buildModpack: function() {
      this.form.name = this.manifest.name
      this.form.author = this.manifest.author
      this.form.version = this.manifest.version
      this.form.minecraft = this.manifest.minecraft.version

      this.manifest.files.forEach(mod => {
        this.form.mods.push(mod.projectID.toString())
      })

      this.form.id = this.modpack.id
      this.form.url = this.modpack.urls.curseforge || this.modpack.urls.project
      
      this.status = 'Waiting user input...'
    },
    fetchLatestModpackFile: function() {
      axios.get('/modding/modpacks/download', { 
        params: {
          id: this.modpack.download.id,
          filename: this.modpack.download.name
        }
      })
      .then(response => {
        this.manifest = response.data
        this.status = 'Getting information from the manifest...'
        this.buildModpack()
      })
      .catch(error => {
        console.error(error)
        this.$root.showSnackBar(`${error.message}: ${error.response.data.error}`, 'error')
      })
    },
    fetchModpack: function() {
      // https://www.curseforge.com/minecraft/modpacks/rlcraft/we_do_not_keep_that/
      const projectID = this.curseforgeURL.split('/')[5]
      axios.get(`https://api.cfwidget.com/minecraft/modpacks/${projectID}`)
        .then(response => {
          this.modpack = response.data
          this.status = 'Downloading modpack latest version...'

          this.fetchLatestModpackFile()
        })
        .catch(error => {
          console.error(error)
          this.$root.showSnackBar(`${error.message}: ${error.response.data.error}`, 'error')
        })
    }
  }
}