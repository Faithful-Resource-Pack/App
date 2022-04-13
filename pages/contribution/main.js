/* global axios */
const contributionModal = () => import('./contributionModal.js')

export default {
  components: {
    contributionModal
  },
  name: 'contribution-page',
  template: `
  <v-container>
    <contribution-modal ref="mod" :contributors='contributors' :onSubmit='onModalSubmit'></contribution-modal>
    <div class="text-h4 py-4">
      {{ $root.lang().database.titles.contributions }}
    </div>
    <v-row>
      <v-col>
        <div class="my-2 text-h5">{{ $root.lang().database.subtitles.resolution }}</div>
        <v-btn
          v-for="(packs_obj) in form.packs"
          :key="packs_obj.key"
          class="my-2 mr-1"
        ><v-checkbox
          v-model="packs_obj.selected"
          :disabled="packs_obj.key != all_packs && (form.packs[0] !== undefined && form.packs[0].selected == true)"
          :label="packs_obj.value"
          :id="packs_obj.key"
        ></v-checkbox>
        </v-btn>
      </v-col>
      <v-col>
        <div class="my-2 text-h5">{{ $root.lang().global.btn.add }}</div>
        <v-btn class="mt-4 mb-2" block @click='newSubmit=true; $refs.mod.open(undefined, packsToChoose(), false)'>{{ $root.lang().database.subtitles.add_manually }}</v-btn>
      </v-col>
    </v-row>
    <div class="my-2 text-h5">{{ $root.lang().database.subtitles.contributor }}</div>
    <v-autocomplete
      v-model="contributors_selected"
      :items="contributors"
      :loading="contributors.length == 0"
      item-text="username"
      item-value="id"
      :label="$root.lang().database.labels.one_contributor"
      multiple
      chips
    >
      <!-- SELECTED THINGY -->
      <template v-slot:selection="data">
        <v-chip
          :key="data.item.id"
          v-bind="data.attrs"
          :input-value="data.selected"
          :disabled="data.disabled"
          close
          @click:close="remove(data.item.id)"
        >
          <v-avatar
            :class="{ accent: data.item.uuid == undefined, 'text--white': true }"
            left
          >
            <template v-if="data.item.uuid != undefined">
              <v-img eager
                :src="'https://visage.surgeplay.com/face/24/' + (data.item.uuid || 'X-Alex')"
                :alt="data.item.username.slice(0, 1).toUpperCase()"
              />
            </template>
            <template v-else>
              {{ (data.item.username || ('' + data.item.id)).slice(0, 1) }}
            </template>
          </v-avatar>
          {{ data.item.username || data.item.id }}
        </v-chip>
      </template>

      <!-- LIST ITEM PART -->
      <template v-slot:item="data">
        <template v-if="data.item && data.item.constructor && data.item.constructor.name === 'String'">
          <v-list-item-content v-text="data.item"></v-list-item-content>
        </template>
        <template v-else>
          <v-list-item-content>
            <v-list-item-title v-text="data.item.username || data.item.id"></v-list-item-title>
            <v-list-item-subtitle v-html="data.item.contributions + ' contribution' + (data.item.contributions > 1 ? 's' : '')"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-avatar :style="{ 'background': data.item.uuid ? 'transparent' : '#4e4e4e' }">
            <template v-if="data.item.uuid">
              <v-img eager :src="'https://visage.surgeplay.com/head/48/' + (data.item.uuid || 'X-Alex')" />
            </template>
            <div v-else>{{ (data.item.username || ('' + data.item.id)).slice(0, 1) }}</div>
          </v-list-item-avatar>
        </template>
      </template>
    </v-autocomplete>
    <v-btn block @click="startSearch()" :disabled="searchDisabled">{{ $root.lang().database.labels.search_contributions }}<v-icon right dark>mdi-magnify</v-icon></v-btn>

    <v-list rounded v-if="search.search_results.length" two-line class="main-container mt-4">
      <v-row><v-col :cols="12/listColumns" xs="1"
          v-for="(contrib_arr, index) in splittedResults"
          :key="index"
        >
        <v-list-item
          v-for="contrib in contrib_arr"
          :key="contrib.id"
        >
          <v-list-item-avatar tile
            :style="{
              'height': '64px',
              'width': '64px',
              'min-width': '64px'
            }"
          >
            <v-img class="texture-img" :src="contrib.url" :lazy-src="'https://database.faithfulpack.net/images/branding/logos/transparent/64/f' + contrib.resolution + '_logo.png'"/>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="(new Date(contrib.date)).toDateString() + ' '+ (!!contrib.textureName ? ' - ' + contrib.textureName : '')"></v-list-item-title>
            <v-list-item-subtitle v-text="(contrib.contributors||[]).map(id => contributors.filter(c => c.id == id)[0].username || '').join(', ')"></v-list-item-subtitle>

            <div><v-chip label x-small class="mr-1">{{ contrib.resolution }}</v-chip><v-chip label x-small class="mr-1">#{{ contrib.texture }}</v-chip></div>
          </v-list-item-content>

          <v-list-item-action class="merged">
            <v-btn icon @click="editContribution(contrib)">
              <v-icon color="lighten-1">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="deleteContribution(contrib.id)">
              <v-icon color="red lighten-1">mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-col></v-row>
    </v-list>
    <div v-else><br><p><i>{{ $root.lang().global.no_results }}</i></p></div>
  </v-container>`,
  data () {
    return {
      maxheight: 170,
      form: {
        packs: [] // [{key: 'all', selected: true }]
      },
      all_packs: 'all',
      all_packs_display: 'All',
      contributors: [],
      contributors_selected: [],
      search: {
        searching: false,
        search_results: []
      },
      newSubmit: false
    }
  },
  computed: {
    searchDisabled: function () {
      const resSelected = this.form.packs.reduce((a, c) => a || c.selected, false) === false
      const result = this.search.searching || resSelected || this.contributors_selected.length === 0
      return result
    },
    listColumns: function () {
      let columns = 1

      if (this.$vuetify.breakpoint.mdAndUp && this.contributors.length >= 6) {
        columns = 2
        if (this.$vuetify.breakpoint.lgAndUp && this.contributors.length >= 21) {
          columns = 3
        }
      }

      return columns
    },
    splittedResults: function () {
      const res = []
      for (let col = 0; col < this.listColumns; ++col) {
        res.push([])
      }

      let arrayIndex = 0
      this.search.search_results.forEach(contrib => {
        res[arrayIndex].push(contrib)
        arrayIndex = (arrayIndex + 1) % this.listColumns
      })

      return res
    },
    onModalSubmit: function() {
      return this.newSubmit ? this.onNewSubmit : this.onChangeSubmit
    }
  },
  methods: {
    getRes: function () {
      axios.get(`${this.$root.apiURL}/contributions/packs`)
        .then(res => {
          res.data.forEach(r => {
            this.addRes(r, r.replaceAll('_', ' '))
          })
        })
    },
    getAuthors: function () {
      axios.get(`${this.$root.apiURL}/contributions/authors`)
        .then(res => {
          this.contributors = res.data
        })
        .catch(console.trace)
    },
    remove (id) {
      const index = this.contributors_selected.indexOf(id)
      if (index >= 0) this.contributors_selected.splice(index, 1)
    },
    addRes (name, value, boolean = false) {
      this.form.packs.push({
        key: name,
        value: value,
        selected: boolean
      })
    },
    startSearch: function () {
      this.search.searching = true
      axios.get(`${this.$root.apiURL}/contributions/search/${this.contributors_selected.join('-')}/${this.form.packs.filter(r => r.selected).map(r => r.key).join('-')}`)
        .then(res => {
          res.data.sort((a, b) => b.date - a.date)
          this.search.search_results = res.data.map(c => {
            return {...c, url: `${this.$root.apiURL}/textures/${c.texture}/url/${c.pack}/latest`}
          })
        })
        .catch(err => { this.$root.showSnackBar(err, 'error') })
        .finally(() => {
          this.search.searching = false
        })
    },
    packsToChoose: function() {
      return this.form.packs.map(p => p.key).filter(p => p !== this.all_packs);
    },
    editContribution: function(contrib) {
      this.newSubmit = false
      this.$refs.mod.open(contrib, packsToChoose(), false)
    },
    onNewSubmit: function(data) {
      axios
        .post(
          `${this.$root.apiURL}/contributions`, 
          {
            date: data.date,
            resolution: parseInt(data.pack.match(/\d+/)[0], 10),
            pack: data.pack,
            authors: data.authors,
            texture: data.texture
          },
          this.$root.apiOptions
        )
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
        })
        .catch(err => { this.$root.showSnackBar(err, 'error') })
    },
    onChangeSubmit: function(data) {
      axios
        .put(
          `${this.$root.apiURL}/contributions/${data.id}`, 
          {
            date: data.date,
            resolution: data.resolution,
            pack: data.pack,
            authors: data.authors,
            texture: data.texture
          },
          this.$root.apiOptions
        )
        .then(() => {
          this.$refs.mod.close()
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.startSearch()
        })
        .catch(err => { this.$root.showSnackBar(err, 'error') })
    },
    deleteContribution: function(id) {
      axios.delete(`${this.$root.apiURL}/contributions/${id}`, this.$root.apiOptions)
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
          this.startSearch() // actualize shown data
        })
        .catch(err => { this.$root.showSnackBar(err, 'error') })
    }
  },
  created: function () {
    this.addRes(this.all_packs, this.all_packs_display, true)
  },
  mounted: function () {
    this.getRes()
    this.getAuthors()

    // use the logged user as default selected contributor
    this.contributors_selected = [this.$root.user.id]
  },
  watch: {
    contributors: {
      handler: function(contributors) {
        // FIX BUG WHERE USERS WITH NO CONTRIBUTIONS GET INCLUDED IN SEARCH
        const contributors_id = contributors.map(c => c.id)
        this.contributors_selected = this.contributors_selected.filter(c => contributors_id.includes(c))
      },
      deep: true
    }
  }
}
