/* global axios */

const SEARCH_DELAY = 300

export default {
  name: 'contribution-modal',
  props: {
    contributors: {
      required: true,
      type: Array
    },
    onCancel: {
      required: false,
      type: Function,
      default: function() {}
    },
    onSubmit: {
      required: false,
      type: Function,
      default: function() {}
    }
  },
  template: `
    <v-dialog
      v-model="opened"
      width="800"
    >      
      <v-card>
        <v-card-title class="headline" v-text="$root.lang().database.titles.contributions"></v-card-title>
        <v-card-text>
          <v-row>
            <v-col class="flex-grow-0 flex-shrink-1">
              <v-date-picker
                v-model="form.date"
                :locale="$root.langBCP47"
                :max="(new Date()).toISOString().substr(0, 10)"
                flat
                scrollable
                show-adjacent-months
              ></v-date-picker>
            </v-col>
            <v-col class="flex-grow-1 flex-shrink-0">
              <h3>{{ $root.lang().database.subtitles.pack }}</h3>
              <v-select
                required
                :items="form.packs"
                v-model="form.pack"></v-select>
              <h3>{{ $root.lang().database.labels.texture_id }}</h3>
              <v-text-field
                required
                v-model="form.texture" />
              <h3>{{ $root.lang().database.titles.contributors }}</h3>
              <v-autocomplete
                v-model="form.authors"
                :items="contributorList"
                :loading="contributors.length == 0 && !isSearching"
                :search-input.sync="search"
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
                          :src="'https://visage.surgeplay.com/face/24/' + data.item.uuid"
                          :alt="data.item.username.slice(0, 1).toUpperCase()"
                        />
                      </template>
                      <template v-else>
                        {{ data.item.username.slice(0, 1) }}
                      </template>
                    </v-avatar>
                    {{ data.item.username }}
                  </v-chip>
                </template>

                <!-- LIST ITEM PART -->
                <template v-slot:item="data">
                  <template v-if="data.item && data.item.constructor && data.item.constructor.name === 'String'">
                    <v-list-item-content v-text="data.item"></v-list-item-content>
                  </template>
                  <template v-else>
                    <v-list-item-content>
                      <v-list-item-title v-text="data.item.username"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-avatar :style="{ 'background': data.item.uuid ? 'transparent' : '#4e4e4e' }">
                      <template v-if="data.item.uuid">
                        <v-img eager :src="'https://visage.surgeplay.com/head/48/' + data.item.uuid" />
                      </template>
                      <div v-else>{{ data.item.username.slice(0, 1).toUpperCase() }}</div>
                    </v-list-item-avatar>
                  </template>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red darken-1"
            text
            @click="closeAndCancel"
          >
            {{ $root.lang().global.btn.cancel }}
          </v-btn>
          <v-btn
            color="darken-1"
            text
            @click="closeOrAndSubmit"
          >
            {{ $root.lang().global.btn.save }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  data () {
    return {
      opened: false,
      closeOnSubmit: true,
      isSearching: false,
      form: {},
      search: null,
      loadedContributors: {},
      searchTimeout: undefined,
      previousSearches: []
    }
  },
  computed: {
    contributorList: function() {
      return [ ...this.contributors, ...Object.values(this.loadedContributors)]
    }
  },
  methods: {
    open: function(inputData = undefined, packs, closeOnSubmit = true) {
      this.opened = true
      if (inputData !== undefined) {
        this.form = Object.assign({}, this.defaultValue(packs), inputData)
        const da = new Date(this.form.date)
        this.form.date = (new Date(da - (da).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
      } else {
        this.form = this.defaultValue(packs)
      }
      this.closeOnSubmit = !!closeOnSubmit
    },
    close: function() {
      this.opened = false
    },
    closeAndCancel: function() {
      this.close()
      this.onCancel()
    },
    closeOrAndSubmit: function() {
      this.opened = !this.closeOnSubmit

      const res = Object.assign({}, this.form)
      res.date = (new Date(res.date)).getTime()
      this.onSubmit(res)
    },
    defaultValue: function (packs) {
      return {
        date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        packs: packs,
        texture: '0',
        authors: []
      }
    },
    remove (id) {
      const index = this.form.contributors.indexOf(id)
      if (index >= 0) this.form.contributors.splice(index, 1)
    },
    startSearch(val) {
      val = val.trim()

      // limit search on client and server side
      if(val.length < 3) return

      // make search only if not searched before
      let alreadySearched = false
      let i = 0
      while(i < this.previousSearches.length && !alreadySearched) {
        alreadySearched = this.previousSearches[i].includes(val)
        ++i
      } 
      if(alreadySearched) return

      this.previousSearches.push(val)
      this.isSearching = true

      axios.get(`/contributions/users/${val}`)
        .then(res => {
          const results = res.data
          console.log(results)
          results.forEach(result => {
            // in case some clever guy forgot its username or uuid or anything
            Vue.set(this.loadedContributors, result.id, Object.merge({
              username: '',
              uuid: '',
              type: [],
              media: []
            }, result))
          })
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.isSearching = false
        })
    }
  },
  created: function() {
    this.form = this.defaultValue()
  },
  watch: {
    search(val) {
      if(!val) return

      if(this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.searchTimeout = setTimeout(() => {
        this.searchTimeout = undefined
        this.startSearch(val)
      }, SEARCH_DELAY)
    }
  }
}
