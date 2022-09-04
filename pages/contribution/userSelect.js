const SEARCH_DELAY = 300

export default {
    name: 'user-select',
    props: {
        contributors: {
          required: true,
          type: Array
        },
        value: {
            required: true
        }
    },
    template: `
<v-autocomplete
    v-model="content"
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
                :alt="(data.item.username || ('' + data.item.id)).slice(0, 1)"
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
        </v-list-item-content>
        <v-list-item-avatar :style="{ 'background': data.item.uuid ? 'transparent' : '#4e4e4e' }">
            <template v-if="data.item.uuid">
            <v-img eager :src="'https://visage.surgeplay.com/head/48/' + data.item.uuid" />
            </template>
            <div v-else>{{ (data.item.username || ('' + data.item.id)).slice(0, 1) }}</div>
        </v-list-item-avatar>
        </template>
    </template>
    </v-autocomplete>
`,
    computed: {
        contributorList: function() {
            return [ ...this.contributors, ...Object.values(this.loadedContributors)]
        }
    },
    data() {
        return {
            content: this.value,
            search: null,
            isSearching: false,
            searchTimeout: undefined,
            previousSearches: [],
            loadedContributors: {},
        }
    },
    watch: {
        content: {
            handler(n) {
                this.$emit('input', n)
            },
            deep: true
        },
        search(val) {
            if(!val) return
    
            if(this.searchTimeout) {
            clearTimeout(this.searchTimeout)
            }
    
            this.searchTimeout = setTimeout(() => {
            this.searchTimeout = undefined
            this.startSearch(val)
            }, SEARCH_DELAY)
        },
    },
    methods: {
        remove (id) {
          const index = this.content.indexOf(id)
          if (index >= 0) this.content.splice(index, 1)
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
                // TODO: create endpoint in API to search for users
            //   this.$root.showSnackBar(err, 'error')
                console.error(err)
            })
            .finally(() => {
              this.isSearching = false
            })
        },
    },
}