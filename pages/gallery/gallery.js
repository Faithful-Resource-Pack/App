/* global axios, Vue */

const LATEST_MC_VERSION = {
  java: '1.18',
  bedrock: '1.17.0'
} 

export default {
  name: 'texture-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">Gallery</div>
    <div v-if="loading.status == true">
      <div class="text-h6 py-6" style="padding: 0px !important">{{ loading.comments.length }}/{{ loading.steps }} Loading...</div>
      {{ loading.comments[loading.comments.length - 1] }}
    </div>

    <template v-if="!loading.status">
      <div class="my-2 text-h5">Resolution</div>
      <v-btn
        v-for="t in resolutions"
        :to="updateRoute(t, 'resolution')"
        :key="t + $route.path"
        :class="{ 'mr-1': true, 'v-btn--active': t === '32x' }"
      >{{ t }}</v-btn>
      <div class="my-2 text-h5">Edition</div>
      <v-btn
        v-for="e in editions"
        :to="updateRoute(e, 'edition')"
        :key="e + $route.path"
        :class="{ 'mr-1': true, 'v-btn--active': e === 'Java' }"
      >{{ e }}</v-btn>
      <div class="my-2 text-h5">Minecraft Version</div>
      <v-btn
        v-for="v in versions"
        :to="updateRoute(v, 'version')"
        :key="v + $route.path"
        :class="{ 'mr-1': true, 'v-btn--active': v === 'Latest' }"
      >{{ v }}</v-btn>
      <div class="my-2 text-h5">Tags</div>
      <v-btn
        v-for="t in tags"
        :to="updateRoute(t, 'tag')"
        :key="t + $route.path"
        :class="{ 'mr-1': true, 'v-btn--active': t === 'All' }"
      >{{ t }}</v-btn>

      <div class="my-2 text-h5">Search</div>
      <div class="my-2">
        <v-text-field
          v-model="search"
          :append-outer-icon="search ? 'mdi-send' : undefined"
          filled
          clear-icon="mdi-close"
          clearable
          :placeholder="$root.lang().database.labels.search_texture"
          type="text"
          v-on:keyup.enter="startSearch"
          @click:append-outer="startSearch"
          @click:clear="clearSearch"
        ></v-text-field>
      </div>
    </template> 
    
    <v-list
      v-if="!loading.status"
      two-line
    >
      <v-row
        style="margin-top: -15px; margin-bottom: 5px; margin-left: -40px; justify-content: center;"
      >
        <v-col
          v-for="(textures_arr, index) in splittedTextures"
          :cols="12/maxColumns"
          :key="index"
          style="padding: 0px; margin-right: -30px"
        >
          <v-list-item
            v-for="texture in textures_arr"
            :key="texture.id"
            style="justify-content: center; margin-bottom: -22px"
          >
            <v-list-item-content style="display: contents">
              <v-tooltip 
                right
                color="#161616"
                content-class="gallery-tooltip"
              >
                <template v-slot:activator="{on, attrs}">
                  <v-list-item-avatar
                    tile
                    :style="{
                      'height': '256px',
                      'width': '256px',
                      'max-width': '256px'
                    }"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <!-- //! Fallback image is only shown when hoverred -->
                    <v-img v-if="!texture.error" @error="texture.error = true" contain class="texture-img" :src="getTextureURL(texture.id)" lazy-src="https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/loading.gif" />
                    <v-img v-if="texture.error" contain class="texture-img" src="https://raw.githubusercontent.com/Compliance-Resource-Pack/Discord-Bot/master/resources/images/error.png" />
                    <v-img contain style="position: absolute; z-index: -1;" class="texture-background" src="https://raw.githubusercontent.com/Compliance-Resource-Pack/Website/master/image/background/transparency_16x.png" />
                  </v-list-item-avatar>
                </template>
                <div class="gallery-tooltip-content">
                  <p class="my-2 text-h5" style="min-width: 256px; margin-top: 5px !important;">[#{{ texture.id }}] {{ texture.name }}</p>
                  <ul>
                    <li>Authors here</li>
                  </ul>
                  <p style="margin-bottom: 0px" align="right"><span v-for="type in texture.type" class="gallery-tags">{{ type }}</span></p>
                </div>
              </v-tooltip>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>
    </v-list>
  </v-container>
  `,
  computed: {
    resolutions() { return this.displayed.resolutions },
    tags() { return [ 'all', ...this.displayed.tags ] },
    versions() { return this.displayed.versions[this.displayedEdition.toLowerCase()] },
    editions() { return this.displayed.editions },

    resolution() {
      if (this.$route.params.resolution && this.resolutions.includes(this.$route.params.resolution))
        return this.$route.params.resolution
      return '32x'
    },
    tag() {
      if (this.$route.params.tag && this.tags.includes(this.$route.params.tag))
        return this.$route.params.tag
      return 'all'
    },
    version() {
      if (this.$route.params.version && this.versions.includes(this.$route.params.version))
        return this.$route.params.version
      return 'latest'
    },
    edition() {
      if (this.$route.params.edition && this.editions.includes(this.$route.params.edition))
        return this.$route.params.edition
      return 'java'
    },
    name() {
      if (this.resolution !== undefined && this.tag !== undefined && this.version !== undefined && this.edition !== undefined)
        return this.$route.params.name
      return undefined
    },

    /**
     * Build the right number of column with the right size of the window
     */
    splittedTextures() {
      const result = []
      const length = this.getter.textures.length

      for (let col = 0; col < this.maxColumns; ++col) result.push([])
      
      let arrayIndex = 0
      for (let i = 0; i < Math.min(this.displayedResults, length); i++) {
        result[arrayIndex].push(this.getter.textures[i])
        arrayIndex = (arrayIndex + 1) % this.maxColumns
      }

      return result
    },
    /**
     * Get the number of column depending on the window size
     */
    maxColumns() {
      // if there is only 1 textures
      if (this.getter.textures.length === 1) return 1

      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return 1
        case 'sm': return 2
        case 'md': return 3
        case 'lg': return 4
        case 'xl': return 6
      }
    }
  },
  methods: {
    /**
     * Update textures with the new search entry
     */
    startSearch() {
      let newRoute

      if (this.name) {
        const splitted = this.$route.path.split('/')
        splitted.pop()
        newRoute = splitted.join('/')
      } else newRoute = this.$route.path

      if (!newRoute.endsWith('/')) newRoute += '/'

      newRoute += this.search

      if (newRoute === this.$route.path) console.warn(newRoute)
      else this.$router.push(newRoute)
    },
    /**
     * Clear search bar & route
     */
    clearSearch() { this.search = ''; this.startSearch() },
    getTextureURL(textureID) {
      const path = this.getter.paths.filter(path => path.useID === `${textureID}a`)[0]
      if (this.edition === 'dungeons')
        return `https://raw.githubusercontent.com/Compliance-Dungeons/Resource-Pack/master/${path.path}`

      console.log(this.edition)
      return `https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-${this.edition == 'java' ? 'Java' : 'Bedrock'}-${this.resolution}/Jappa-${this.version == 'latest' ? LATEST_MC_VERSION[this.edition] : this.version}/${path.path}`
    },
    /**
     * Update Vue Router with the given data
     * @param {String} type type of param
     * @param {String} data param to update
     */
    updateRoute(data, type) {
      this.$route.params[type] = data
    },
    /**
     * Update everything
     * TODO: description needs to be detailed
     */
    async update(doesLoading = true) {
      // fetch all required files: 
      const options = [
        { message: 'Getting textures...', route: `/gallery/textures/${this.edition}/${this.version}/${this.tag}/${this.name ? this.name : ''}`, key: 'textures' },
        { message: 'Getting textures types...', route: '/textures/types', key: 'types' },
        { message: 'Getting supported Minecraft versions...', route: '/textures/versions', key: 'versions' },
        { message: 'Getting textures paths...', route: `/gallery/paths/${this.edition}/${this.version}/${this.tag}/${this.name ? this.name : ''}`, key: 'paths' },
        { message: 'Getting textures uses...', route: `/gallery/uses/${this.edition}/${this.version}/${this.tag}/${this.name ? this.name : ''}`, key: 'uses' },
        { message: 'Getting contributions...', route: '/contributions/all', key: 'contributions' },
        { message: 'Getting contributors...', route: '/contributors/all', key: 'contributors' }
      ]
      this.get(options, doesLoading)
      this.$forceUpdate()
    },
    /**
     * Get all objects from database
     * @param {Array} options getter options
     */
    async get(options, doesLoading = true) {
      if (doesLoading) this.loading = { status: true, comments: [], steps: options.length }

      for (let i = 0; i < options.length; i++) {
        if (doesLoading) this.loading.comments.push(options[i].message)

        let response = {}
        try {
          response = await axios.get(options[i].route)
        } catch (err) {
          if (doesLoading) this.loading.comments.push(err)
          console.error(err)
          break
        }

        this.getter[options[i].key] = response.data
      }
      
      if (doesLoading) this.loading = { status: false, comments: [], steps: 0 }
    }
  },
  watch: {
    $route () {
      this.update(false)
    }
  },
  mounted() {
    this.update()
  },
  created() {
    // directly add the search to the search bar if there is a search parameter inside the router
    this.search = this.$route.params.name ? this.$route.params.name : ''
  },
  data() {
    return {
      /**
       * @property {Boolean} status true if the page is loading
       * @property {Integer} steps Number of steps before the loading ends
       * @property {Array<String>} comments used to get the step where the loading is at
       */
      loading: { comments: [], status: true, steps: 0 },

      /**
       * @property {Object} getter : object with all fetched objects
       */
      getter: {
        textures: [],
        types: [], // textures types
        versions: [], // minecraft versions
        paths: [],
        uses: [],
        // contributions: {}, // textures contributions //! might be useless
        // contributors: {}, //! might be useless
      },

      /**
       * @property {Object} displayed object with all builded information to display
       */
      displayed: {
        resolutions: ['32x', '64x'],
        editions: [ 'java', 'bedrock', /** 'dungeons' */ ],
        tags: [],
        versions: {
          java: [ '1.18' ],
          bedrock: [ '1.17' ],
          dungeons: [ 'latest' ],
        },
      },

      // displayed textures on screen (avoid huge loading & freeze)
      displayedResults: 100,
      
      // actual edition displayed
      displayedEdition: 'java',

      // searched text:
      search: ''
    }
  }
}