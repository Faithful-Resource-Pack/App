/* global axios */
const contributionModal = () => import('./contributionModal.js')

export default {
  components: {
    contributionModal
  },
  name: 'contribution-page',
  template: `
  <v-container>
    <contribution-modal ref="mod" :contributors='contributors' :onSubmit='onModalSubmit' :multiple="multiple"></contribution-modal>
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
          :label="packs_obj.value"
          :id="packs_obj.key"
          @change="(val) => onPackChange(val, packs_obj.key)"
        ></v-checkbox>
        </v-btn>
      </v-col>
      <v-col>
        <div class="my-2 text-h5">{{ $root.lang().global.btn.add }}</div>
        <v-btn class="mt-4 mb-2" block @click='newSubmit=true; $refs.mod.open(undefined, packsToChoose, false)'>{{ $root.lang().database.subtitles.add_manually }}</v-btn>
      </v-col>
    </v-row>
    <div class="my-2 text-h5">{{ $root.lang().database.subtitles.search }}</div>
    <div class="row">
      <div class="col-sm-6 col-12">
        <div class="my-sm-2 text-h6">{{ $root.lang().database.subtitles.contributor }}</div>
        <v-autocomplete
          v-model="contributors_selected"
          :items="contributors"
          :loading="contributors.length == 0"
          item-text="username"
          item-value="id"
          :label="$root.lang().database.labels.one_contributor"
          multiple
          hide-details
          class="mb-0"
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
                <v-list-item-title v-text="data.item.username || $root.lang().database.labels.anonymous + ' (' + data.item.id + ')'"></v-list-item-title>
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
      </div>
      <div class="col-sm-6 col-12">
        <div class="my-sm-2 text-h6">{{ $root.lang().database.titles.textures }}</div>
        <v-text-field
          style="margin-top: 10px"
          type="search"
          v-model="textureSearch"
          class="pt-5 mb-0"
          :label="$root.lang().database.labels.search_texture"
          @keydown.enter="startSearch()"
          hide-details
        />
      </div>
    </div>
    <v-btn block color="primary" @click="startSearch()" :disabled="searchDisabled" class="mt-5">{{ $root.lang().database.labels.search_contributions }}<v-icon right dark>mdi-magnify</v-icon></v-btn>
    <v-list rounded v-if="search.search_results.length" two-line class="main-container mt-4">
      <v-row><v-col :cols="12/listColumns" xs="1"
          v-for="(contrib_arr, index) in splittedResults"
          :key="index"
        >
        <v-list-item
          v-for="(contrib, i) in contrib_arr"
          :key="contrib.id"
          v-if="i < displayedResults"
        >
          <v-list-item-avatar tile class="texture-preview">
            <a :href="'/#/gallery?show=' + contrib.texture">
            <v-img class="texture-img" :src="contrib.url" :lazy-src="'https://database.faithfulpack.net/images/branding/logos/transparent/64/f' + contrib.resolution + '_logo.png'"/>
            </a>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="momo(new Date(contrib.date)).format('ll') + ' '+ (!!contrib.name ? ' - ' + contrib.name : '')"></v-list-item-title>
            <v-list-item-subtitle v-text="(contrib.authors||[]).map(id => contributors.filter(c => c.id == id)[0].username || id).join(', ')"></v-list-item-subtitle>

            <div><v-chip label x-small class="mr-1">
              {{ packToCode(contrib.pack) }}
            </v-chip><a :href="'/#/gallery?show=' + contrib.texture" target="_blank"><v-chip style="cursor: pointer" label x-small class="mr-1">
              #{{ contrib.texture }} <span class="mdi mdi-open-in-new ml-1"></span>
            </v-chip></a>
            </div>
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

      <v-btn 
        :style="{ 'margin': 'auto', 'min-width': '250px !important' }"
        :disabled="displayedResults >= search.search_results.length"
        block
        color="primary"
        @click="showMore()" 
        :v-if="displayedResults < search.search_results.length"
        elevation="2"
      >{{ $root.lang().global.btn.load_more }}</v-btn>
    </v-list>
    <div v-else><br><p><i>{{ $root.lang().global.no_results }}</i></p></div>
  </v-container>`,
  data () {
    const INCREMENT = 250

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
      textureSearch: '',
      displayedResults: INCREMENT,
      newSubmit: false,
    }
  },
  computed: {
    queryToIds: function() {
      if(this.$route.query.ids) {
        return this.$route.query.ids.split('-')
      }
      
      // use the logged user as default selected contributor
      return [this.$root.user.id]
    },
    idsToQuery: function() {
      return {
        ids: this.contributors_selected.join('-')
      }
    },
    searchDisabled: function () {
      const resSelected = this.form.packs.reduce((a, c) => a || c.selected, false) === false
      const invalidTextSearch = this.textureSearch.length < 3 && Number.isNaN(Number.parseInt(this.textureSearch))
      const result = this.search.searching || resSelected || (this.contributors_selected.length === 0 && invalidTextSearch)
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
    multiple: function() {
      return this.newSubmit
    },
    packsSelected: function() {
      return this.form.packs
        .filter(entry => entry.selected)
    },
    packsToChoose: function() {
      return this.form.packs
        .filter(entry => entry.key !== this.all_packs)
        .map(entry => entry.key)
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
    momo: function(...args) {
      return moment(...args)
    },
    packToCode: function(pack) {
      if(pack === 'default') {
        return '16x'
      }
      if(pack.includes('classic_faithful_32x')) {
        if(pack.includes('progart'))
          pack = pack.replace('progart', '__p_a')
        else
          pack += "__j_a_p_p_a"

        console.log(pack)
      }
      return pack
        .split('_').map(word => {
          let number = Number.parseInt(word, 10);
          
          return Number.isNaN(number) ? (word[0] || ' ').toUpperCase() : number
        }).join('')
    },
    showMore: function() {
      this.displayedResults += 100;
    },
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
          // assign the result, but sorted by username
          this.contributors = res.data.sort((a, b) => {
            if (!a.username && !b.username) return 0
            if (a.username && !b.username) return 1;
            if (!a.username && b.username) return -1;

            return a.username.toLowerCase() > b.username.toLowerCase() ? 1 : ((b.username.toLowerCase() > a.username.toLowerCase()) ? -1 : 0)
          })
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
      axios.get(`${this.$root.apiURL}/contributions/search
?packs=${this.packsSelected.map(r => r.key).join('-')}
&users=${this.contributors_selected.join('-')}
&search=${this.textureSearch}`)
        .then(res => {
          res.data.sort((a, b) => b.date - a.date)
          this.search.search_results = res.data.map(c => {
            return {...c, url: `${this.$root.apiURL}/textures/${c.texture}/url/${c.pack}/latest`}
          })
        })

        // fetch contribution textures names
        .then(() => this.search.search_results.map(c => c.texture))
        .then(all_ids => {
          // split request in groups
          return Promise.all(all_ids.reduce((acc, cur, index) => {
            if(index % 30 === 0) { acc.push([])}
            acc[acc.length-1].push(cur)
            return acc;
          }, []).map(ids => {
            // optimize array search by deleting double
            return axios.get(`${this.$root.apiURL}/textures/${ids.filter((v, i, a) => a.indexOf(v) === i).join(',')}`);
          })
          )
        })
        .then(results => {
          const texturesFromIds = results.map(r => r.data).flat() // remerge results
          
          this.search.search_results.forEach((contrib) => {
            const found_texture = texturesFromIds.find(t => t.id === contrib.texture);
            contrib.name = found_texture ? found_texture.name : ''; // find texture with null string fallback (sometimes we get a 404)
          })
        })
        
        .finally(() => this.search.searching = false)
        .catch(err => this.$root.showSnackBar(err, 'error'))
    },
    editContribution: function(contrib) {
      this.newSubmit = false
      this.$refs.mod.open(contrib, this.packsToChoose, false)
    },
    onNewSubmit: async function(entries) {
      for(let i = 0; i < entries.length; ++i) {
        const data = entries[i];
        await axios
        .post(
          `${this.$root.apiURL}/contributions`, 
          {
            date: data.date,
            resolution: parseInt(data.pack.match(/\d+/)[0], 10),
            pack: data.pack,
            authors: data.authors,
            texture: String(data.texture)
          },
          this.$root.apiOptions
        )
        .then(() => {
          this.$root.showSnackBar(this.$root.lang().global.ends_success, 'success')
        })
        .catch(err => { this.$root.showSnackBar(err, 'error') })
      }
    },
    onPackChange: function(selected, key) {
      if(key === this.all_packs) {
        if(selected) {
          // just checked all, unckeck others
          // better to make all of them not selected instead of replacing data
          // more stable if more data in entries
          this.form.packs.forEach(entry => {
            if(entry.key === this.all_packs) return

            entry.selected = false
          })
        } else {
          this.onPackUnselected(key)
        }
      } else {
        // other pack
        if(selected) {
          // uncheck all
          const index_all = this.form.packs.findIndex(entry => entry.key === this.all_packs)
          this.form.packs[index_all].selected = false
        } else {
          this.onPackUnselected(key)
        }
      }
    },
    onPackUnselected: function(key) {
      // ensure at least one selected
      if(this.packsSelected.length === 0) {
        const index_entry = this.form.packs.findIndex(entry => entry.key === key)

        // needs to be changed on next tick, cannot change same data on same cycle
        this.$nextTick(() => {
          Vue.set(this.form.packs[index_entry], 'selected', true)
        })
      } else {
        // do nothing, at least one is selected
      }
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
            texture: String(data.texture)
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
    this.contributors_selected = this.queryToIds
    this.addRes(this.all_packs, this.all_packs_display, true)
  },
  mounted: function () {
    this.getRes()
    this.getAuthors()
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
