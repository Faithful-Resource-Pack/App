/* global axios, Vue */
const removeConfirm = () => import('./removeConfirm.js')
const fileForm = () => import('./fileForm.js')

export default {
  name: 'contributor-page',
  components: {
    removeConfirm,
    fileForm
  },
  template: `
    <v-container>
      <remove-confirm :opened="removeOpened" :on-cancel="() => { removeOpened = false }" :on-confirm="remove">
        <pre style="overflow: auto; max-height: 220px;" class="pa-1">{{ selectedToRemove }}</pre>
      </remove-confirm>
      <remove-confirm :title="editTitle" :opened="editOpened" :on-cancel="() => { editOpened = false }" :on-confirm="edit" :confirm-text="editConfirmText">
        <file-form v-if="lastEdit !== undefined" v-model="lastEdit" />
      </remove-confirm>
      <v-card class="rounded px-2 pb-3" color="rgba(255, 255, 255, 0.08)" style="background-color: rgba(255,255,255,.05)">
        <v-card-title class="text-h4 py-4">
          {{ $root.lang().database.titles.files }}
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            :label="$root.lang().global.btn.search"
            autofocus
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            @click="() => { confirmEdit({ parent: {}}) }"
          >
            {{ this.$root.lang().global.btn.add }} 
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-card-title>
        <v-data-table
          :headers="headers"
          dense
          multi-sort
          show-select
          v-model="selected"
          :items="displayedFiles"
          :loading="displayedFiles.length == 0"
          :items-per-page="15"
          class="elevation-1"
          :search="search"
        >
          <template v-slot:item.name="{ item }">
            <i v-if="item.name === null">null</i>
            <span v-else>{{ item.name }}</span>
          </template>

          <template v-slot:item.parent="{ item }">
            <v-chip
              v-for="pa in item.parent"
              class="ma-1"
              small
            >
              {{ pa }}
            </v-chip>
          </template>

          <template v-slot:item.source="{ item }">
            <div style="max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"><a :href="item.source" target="_blank">{{item.source}}</a></div>
          </template>
          
          <template v-slot:item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="confirmEdit(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="confirmRemove(item)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-container>`,
  data () {
    return {
      files: [],
      headers: [
        { text: "Name", value: "name" },
        { text: "Use", value: "use" },
        { text: "Type", value: "type" },
        { text: "Parent", value: "parent" },
        { text: "Source", value: "source" },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      search: '',
      selected: [],
      removeOpened: false,
      lastRemoved: undefined,
      editOpened: false,
      lastEdit: undefined
    }
  },
  computed: {
    displayedFiles: function() {
      return Object.keys(this.files).map(id => {
        let el = {
          ...this.files[id],
          id: id
        }
        el.parent = Object.values(el.parent)
        return el 
      })
    },
    editTitle: function() {
      if(this.lastEdit !== undefined && this.lastEdit.id === undefined) return this.$root.lang().global.btn.add

      return this.$root.lang().global.btn.edit
    },
    editConfirmText: function() {
      return this.editTitle
    },
    selectedToRemove: function() {
      let items = [this.lastRemoved]
      if(this.selected.length !== 0) items = this.selected

      return items
    }
  },
  methods: {
    getFiles: function() {
      this.files = []
      return axios.get('/files/')
        .then(res => {
          this.files = res.data
        })
    },
    confirmEdit: function(item) {
      this.lastEdit = (item.id !== undefined) ? { ...this.files[item.id] } : item
      this.editOpened = true
    },
    edit: function() {
      const id = this.lastEdit.id

      const method = id === undefined ? 'post' : 'put'
      const url = '/files/' + (id || '')

      axios[method](url, this.$root.addToken(this.lastEdit))
      .then(() => {
        this.editOpened = false
        this.getFiles()
      })
      .catch(err => {
        this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
      })
    },
    confirmRemove: function(item) {
      this.lastRemoved = item
      this.removeOpened = true
    },
    remove: function() {
      // get data ids
      const data = this.selectedToRemove.map(e => e.id)

      // delete
      const prom = axios.delete('/files/' + data.join(','), { params: this.$root.addToken({}) })
      .catch(err => {
        this.$root.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
      })
      let res = prom

      res = prom.then(() => {
        // when successfully deleted
        this.removeOpened = false
        this.getFiles()
      })
      .catch(err => {
        this.$root.showSnackBar(`${err.message}`, 'error')
      })

      return res
    }
  },
  mounted: function() {
    this.getFiles()
  }
}
