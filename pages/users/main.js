/* global axios, Vue */
const UserModal = () => import('./modal.js')
const UserRemoveConfirm = () => import('./remove-confirm.js')

export default {
  name: 'contributor-page',
  components: {
    UserModal,
    UserRemoveConfirm
  },
  template: `
    <v-container>
      <user-modal :dialog="dialogOpen" :disableDialog="disableDialog" :add="dialogDataAdd" :data="dialogData" :roles="roles"></user-modal>
      <user-remove-confirm :confirm="remove.confirm" :disableDialog="function() { remove.confirm = false; update() }" :data="remove.data"></user-remove-confirm>

      <div class="text-h4 py-4">
        {{ $root.lang().database.titles.users }}
      </div>
      <div>
        <div class="my-2 text-h5">{{ $root.lang().database.subtitles.select_contributor_role }}</div>
        <div><v-btn v-for="t in usersRoles" :key="t" :class="{ 'my-2': true, 'mr-1': true, 'v-btn--active primary': (t === 'All' && !role && !!name) || (t && role && t.toLowerCase() === role.toLowerCase()) }" :to="userURL(t)" :exact="t == 'All'">{{ t }}</v-btn></div>
        <div class="my-2 text-h5">{{ $root.lang().database.subtitles.search }}</div>
        <div class="my-2">
          <v-text-field
            v-model="search"
            :append-outer-icon="search ? 'mdi-send' : undefined"
            filled
            clear-icon="mdi-close"
            clearable
            :placeholder="$root.lang().database.labels.search_username"
            type="text"
            hide-details 
            v-on:keyup.enter="startSearch"
            @click:append-outer="startSearch"
            @click:clear="clearSearch"
          ></v-text-field>
        </div>
        
        <v-btn block color="primary" @click="startSearch()" class="mt-4">{{ $root.lang().database.subtitles.search }}<v-icon right dark>mdi-magnify</v-icon></v-btn>

        <v-btn block @click="openDialog()" class="my-6">{{ $root.lang().database.labels.add_new_contributor }} <v-icon right dark>mdi-plus</v-icon></v-btn>

        <div class="my-2 text-h5">{{ $root.lang().database.labels.contributors_results }}</div>
        <div v-if="loading" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
        </div>
        <v-list rounded v-else-if="users.length" two-line class="main-container">
          <v-row><v-col :cols="12/listColumns" xs="1"
              v-for="(users, index) in splittedUsers"
              :key="index"
            >
            <v-list-item
              v-for="user in users"
              :key="user.id"
            >
              <v-list-item-avatar
                :style="{
                  'height': '64px',
                  'width': '64px',
                  'min-width': '64px',
                  'border-radius': '10px'
                }"
              >
                <v-img v-if="user.uuid" :src="'https://visage.surgeplay.com/head/48/' + user.uuid" />
                <v-icon large v-else style="background: rgba(39, 39, 39, 0.8);">mdi-account</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="user.username"></v-list-item-title>

                <v-list-item-subtitle v-text="(user.roles||[]).join(', ')"></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action class="merged">
                <v-btn icon @click="openDialog(user)">
                  <v-icon color="lighten-1">mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="askRemove(user)">
                  <v-icon color="red lighten-1">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-col></v-row>
        </v-list>
        <div v-else><br>
          <p><i>{{ $root.lang().global.no_results }}</i></p>
        </div>
      </div>
    </v-container>`,
  data () {
    return {
      recompute: false,
      roles: [],
      search: '',
      searchPromise: undefined,
      users: [],
      loading: false,
      dialogOpen: false,
      dialogData: {},
      dialogDataAdd: false,
      remove: {
        confirm: false,
        data: {}
      }
    }
  },
  methods: {
    userURL (t) {
      return '/users/' + t + '/' + (this.name || '')
    },
    startSearch: function () {
      // ok so url is /whatever/ => /whatever/<search>
      // ok so url is /whatever/<oldSearch> => /whatever/<search>
      // ok so url is /whatever/<role> =>/whatever/<role>/<search>
      // ok so url is /whatever/<role>/<name> => /whatever/<role>/<search>
      let newPath
      if (this.name) {
        const splitted = this.$route.path.split('/')
        splitted.pop()
        newPath = splitted.join('/')
      } else {
        newPath = this.$route.path
      }

      if (!newPath.endsWith('/')) { newPath += '/' }

      if(this.search)
        newPath += this.search

      if (newPath !== this.$route.path) {
        this.$router.push(newPath).catch(() => {})
      }
      this.getUsers()
    },
    getRoles: function () {
      axios.get(`${this.$root.apiURL}/users/roles`)
        .then((response) => {
          this.roles = response.data
        })
        .catch(function (error) {
          console.error(error)
        })
        .finally(() => {
          Vue.nextTick(() => {
            this.search = this.name
          })
        })
    },
    getUsers: function () {
      this.loading = true
      let url = `${this.$root.apiURL}${this.$route.path.split('/').map(str => str === 'users' ? 'users/role' : str).join('/')}`
      axios.get(url, this.$root.apiOptions)
        .then((res) => {
          this.users = res.data
        })
        .catch(err => console.error(err))
        .finally(() => {
          this.loading = false
        })
    },
    update: function () {
      this.getRoles()
      this.getUsers()
    },
    clearSearch: function () {
      this.search = ''
      this.startSearch()
    },
    openDialog: function (data = undefined) {
      this.dialogData = data;
      this.dialogDataAdd = data === undefined ? true : false;
      this.dialogOpen = true;
    },
    disableDialog: function (refresh = false) {
      this.dialogOpen = false;
      this.dialogData = {};
      this.dialogDataAdd = false;

      if (refresh) this.update();
    },
    askRemove: function (data) {
      this.remove.data = data
      this.remove.confirm = true
    }
  },
  computed: {
    usersRoles: function () {
      return ['all', ...this.roles]
    },
    role: function () {
      if (this.$route.params.type && this.usersRoles.includes(this.$route.params.type)) {
        return this.$route.params.type
      }
      return undefined
    },
    name: function () {
      if (this.role !== undefined) {
        return this.$route.params.name
      }

      return this.$route.params.type
    },
    listColumns: function () {
      let columns = 1

      if (this.$vuetify.breakpoint.mdAndUp && this.users.length >= 6) {
        columns = 2
        if (this.$vuetify.breakpoint.lgAndUp && this.users.length >= 21) {
          columns = 3
        }
      }

      return columns
    },
    splittedUsers: function () {
      const res = []
      for (let col = 0; col < this.listColumns; ++col) {
        res.push([])
      }

      let arrayIndex = 0
      this.users.forEach(contrib => {
        res[arrayIndex].push(contrib)
        arrayIndex = (arrayIndex + 1) % this.listColumns
      })

      return res
    }
  },
  mounted: function () {
    this.getRoles()
  }
}
