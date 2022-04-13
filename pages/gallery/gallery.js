/* global axios, Vue */

const textureModal = () => import('./modal.js')

export default {
  name: 'texture-page',
  components: {
    textureModal
  },
  template: `
  <v-container>
    <div class="text-h4 py-4">{{ $root.lang().gallery.title }}</div>

    <v-row>
      <v-col cols="12" sm="6">
        <div class="my-2 text-h5">{{ $root.lang().gallery.category.resolution }}</div>
        <v-btn
          v-for="t in options.resolutions"
          :key="t + $route.path"
          style="margin-bottom: 5px"
          v-on:click="updateRoute(t, 'resolution')"
          :class="['mr-1', { 'v-btn--active': t === resolution }]"
          v-text="t"
        ></v-btn>
      </v-col>

      <v-col cols="12" sm="6">
        <div class="my-2 text-h5">{{ $root.lang().gallery.category.edition }}</div>
        <v-btn 
          v-for="t in options.editions"
          :key="t + $route.path"
          style="margin-bottom: 5px"
          v-on:click="updateRoute(t, 'edition')"
          :class="['mr-1', { 'v-btn--active': t === edition }]"
          v-text="t"
        ></v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <div class="my-2 text-h5">{{ $root.lang().gallery.category.mc_version }}</div>
        <v-btn
          v-for="t in options.versions"
          :key="t + $route.path"
          style="margin-bottom: 5px"
          v-on:click="updateRoute(t, 'version')"
          :class="{ 'mr-1': true, 'v-btn--active': t === version }"
          v-text="t"
        ></v-btn>
      </v-col>

      <v-col cols="12" sm="6">
        <div class="my-2 text-h5">{{ $root.lang().gallery.category.tags }}</div>
        <v-btn
          v-for="t in options.tags"
          :key="t + $route.path"
          style="margin-bottom: 5px"
          v-on:click="updateRoute(t, 'tag')"
          :class="{ 'mr-1': true, 'v-btn--active': t === tag }"
          v-text="t"
        ></v-btn>
      </v-col>
    </v-row>

    <div class="my-2 text-h5">{{ $root.lang().gallery.category.search }}</div>
    <div class="my-2">
      <v-text-field
        v-model="current.search"
        :append-icon="current.search ? 'mdi-send' : undefined"
        filled
        clear-icon="mdi-close"
        clearable
        :placeholder="$root.lang().database.labels.search_texture"
        type="text"
        v-on:keyup.enter="startSearch"
        @click:append="startSearch"
        @click:clear="clearSearch"
      ></v-text-field>
    </div>
    
    <v-list
      class="main-container pa-2"
      two-line
    >
      <template v-if="loading.status == true">
        <div class="text-h6 py-6" style="padding: 0 10px !important">{{ loading.comments.length }}/{{ loading.steps }} {{ $root.lang().gallery.loading_message.general }}</div>
        <span style="padding: 0 10px;">{{ loading.comments[loading.comments.length - 1] }}</span>
      </template>
      <template v-if="!loading.status && displayedTextures.length === 0">
        <div class="text-h6" style="padding: 0 10px !important">{{ $root.lang().global.no_results }}</div>
      </template>

      <div
        v-if="!loading.status"
        class="gallery-textures-container"
      >
        <div
          v-for="(texture, index) in displayedTextures"
          :key="texture.id"
          v-if="index <= displayedResults"
          class="gallery-texture-in-container"
          v-tooltip.right-start="{content: () => getAuthor(texture.textureID), html: true}"
          @click.stop="() => openModal(texture.textureID)"
        >
          <img
            class="gallery-texture-image"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block'; this.parentElement.style.background='rgba(0,0,0,0.3)';this.parentElement.classList.add('rounded')"
            :src="texture.url"
            lazy-src="https://database.faithfulpack.net/images/bot/loading.gif" />
          <div class="not-done" style="display: none;">
            <span></span><div>
              <h1>#{{ texture.textureID }}</h1>
              <h3>{{ texture.name }}</h3>
              <p>{{ $root.lang().gallery.error_message.texture_not_done }}</p>
            </div>
          </div>
        </div>
      </div>
    </v-list>

    <texture-modal
      v-model="modalOpen"
      :textureID="modalTextureID"
      :textureObj="modalTextureObj"
      :contributors="displayed.contributors"
    ></texture-modal>

    <v-btn icon large @click="toTop" v-show="scrollY > 300" class="go_up_btn">
      <v-icon>
        mdi-arrow-up
      </v-icon>
    </v-btn>
  </v-container>
  `,
  data() {
    return {
      loading: {
        status: false,
        steps: 0,
        comments: []
      },
      options: {
        resolutions: ['16x', ...settings.resolutions],
        tags: ['All'],
        versions: settings.versions.java,
        editions: settings.editions.map(e => e.toLowerCase())
      },
      current: {
        resolution: settings.resolutions[0],
        tag: 'All',
        version: settings.versions.java[0],
        edition: settings.editions[0],
        search: null
      },
      dataJSON: {},
      displayed: {
        paths: {},
        uses: {},
        textures: {},
        contributions: {
          c32: [],
          c64: []
        },
        contributors: {}
      },
      displayedResults: 20,
      displayedTextures: [],
      modalTextureID: null,
      modalTextureObj: {},
      modalOpen: false,
    }
  },
  computed: {
    resolutions() { return this.options.resolutions },
    tags() { return ['all', ...this.options.tags] },
    versions() { return this.options.versions },
    editions() { return this.options.editions },

    resolution() { return this.current.resolution },
    tag() { return this.current.tag },
    version() { return this.current.version },
    edition() { return this.current.edition },
    search() { return this.current.search },
  },
  watch: {
    '$route.params': {
      handler(params) {
        this.current.resolution = params.resolution
        this.current.edition = params.edition
        this.current.version = params.version
        this.current.tag = params.tag
        this.current.search = params.search

        this.updateJSON(true)
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // directly add the search to the search bar if there is a search parameter inside the router
    this.current.search = this.$route.params.search ? this.$route.params.search : undefined
    this.options.versions = this.$route.params.edition ? settings.versions[this.$route.params.edition] : settings.versions[0]

    window.addEventListener('scroll', this.handleScroll)
  },
  methods: {
    openModal(id) {
      this.modalTextureID = id
      this.modalTextureObj = {} // changes text back to loading text if reopening modal
      this.modalOpen = true

      axios.get('/gallery/dialog/' + id)
        .then(res => {
          this.modalTextureObj = res.data
        })
    },
    splittedTextures() {
      // we load texture URL here as it is called after this.displayed.uses is updated
      // reduces also inline code
      return Object.values(this.displayed.textures).map(texture => {
        return {
          ...texture,
          url: this.getTextureURL(texture.useID)
        }
      })
    },
    getAuthor(textureID) {
      let contributionsHTML = ''

      let contributions = this.displayed.contributions[this.current.resolution === '32x' ? 'c32' : 'c64'][textureID]
      if (contributions) {
        const timestamp = contributions.reduce((a, b) => a = a > b.date ? a : b.date, 0)
        const contribution = contributions.filter(el => el.date == timestamp)[0]

        contributionsHTML = `
          <li>
            <p><i class="icon-people${contribution.contributors.length == 1 ? '' : 's'}"></i>${contribution.contributors.map(c => this.discordIDtoName(c)).join(', ')}</p>
            <p><i class="icon-time"></i>${this.timestampToDate(timestamp)}</p>
          </li>
        `
      }
      else contributionsHTML = `<li class="danger-text"><p>${this.$root.lang().gallery.error_message.contribution_not_found}</p></li>`

      if (this.current.resolution === '16x') contributionsHTML = `<li><i class="icon-mojang-red"></i>Mojang Studios</li>`

      return `
      <div class="texture-tooltip">
        <div class="texture-info-container">
          <h1 align="left" class="encased">#${textureID}&nbsp;&dash;&nbsp;${this.displayed.textures[textureID].name}</h1>
          <ul align="left" class="encased">${contributionsHTML}</ul>
        </div>
        <div class="texture-tags-container">
          <span class="encased">#${this.displayed.textures[textureID].tags.join('</span><span class="encased">#')}</span>
        </div>
      </div>
      `
    },
    discordIDtoName(d) {
      return this.displayed.contributors[d] ? this.displayed.contributors[d].username : this.$root.lang().gallery.error_message.user_not_found
    },
    timestampToDate(t) {
      const a = new Date(t)
      const months = [this.$root.lang().global.months.jan, this.$root.lang().global.months.feb, this.$root.lang().global.months.mar, this.$root.lang().global.months.apr, this.$root.lang().global.months.may, this.$root.lang().global.months.jun, this.$root.lang().global.months.jul, this.$root.lang().global.months.aug, this.$root.lang().global.months.sep, this.$root.lang().global.months.oct, this.$root.lang().global.months.nov, this.$root.lang().global.months.dec]
      const year = a.getFullYear()
      const month = months[a.getMonth()]
      const date = a.getDate().toString().length == 1 ? `0${a.getDate()}` : a.getDate()
      return `${month} ${date}, ${year}`
    },
    startSearch() {
      let route = `/gallery/${this.current.edition}/${this.current.resolution}/${this.current.version}/${this.current.tag}`
      route += this.current.search === null ? '' : `/${this.current.search}`

      if (this.$route.path === route) return // new search is the same as before
      return this.$router.push(route)
    },
    clearSearch() {
      this.current.search = null
      this.startSearch()
    },
    getTextureURL(useID) {
      let use = this.displayed.uses[useID]
      // fixes bug when sometimes, uses are not updated yet
      if(use === undefined) use = Object.values(this.displayed.uses)[0]
      
      // find path from use and path ID
      const path = this.displayed.paths[use.pathID]

      // TODO: use api v2 here
      switch (this.edition) {
        case 'bedrock':
          if (this.resolution === '16x') return `https://raw.githubusercontent.com/CompliBot/Default-Bedrock/${this.version == 'latest' ? settings.versions[this.edition][0] : this.version}/${path.path}`
          return `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-Bedrock-${this.resolution}/${this.version == 'latest' ? settings.versions[this.edition][0] : this.version}/${path.path}`
        case 'java':
          if (this.resolution === '16x') return `https://raw.githubusercontent.com/CompliBot/Default-Java/${this.version == 'latest' ? settings.versions[this.edition][0] : this.version}/${path.path}`
          return `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-Java-${this.resolution}/${this.version == 'latest' ? settings.versions[this.edition][0] : this.version}/${path.path}`
      }

      // TODO: put a default value
      return ''
    },
    updateRoute(data, type) {
      if (this.current[type] === data) return // avoid redundant redirection
      this.current[type] = data

      // user safe interaction
      // check if resolution exist
      if (!settings.resolutions.includes(this.current.resolution) && this.current.resolution !== '16x')
        this.current.resolution = settings.resolution[0]

      // check if edition exist
      if (!settings.editions.includes(this.current.edition))

        if (!settings.versions[this.current.edition.toLowerCase()].includes(this.current.version)) {
          this.current.version = settings.versions[this.current.edition][0]
          this.options.versions = settings.versions[this.current.edition]
        }

      this.$router.push({ params: { ...this.current } })
    },
    updateJSON(loadMessage = false) {
      const params = [
        { message: this.$root.lang().gallery.loading_message.tags, route: '/textures/types', key: 'tags' },
        { message: this.$root.lang().gallery.loading_message.textures, route: `/gallery/textures/${this.edition}/${this.version}/${this.tag}/${this.search ? this.search : ''}`, key: 'textures' },
        { message: this.$root.lang().gallery.loading_message.paths, route: `/gallery/paths/${this.edition}/${this.version}/${this.tag}/${this.search ? this.search : ''}`, key: 'paths' },
        { message: this.$root.lang().gallery.loading_message.uses, route: `/gallery/uses/${this.edition}/${this.version}/${this.tag}/${this.search ? this.search : ''}`, key: 'uses' },
        { message: this.$root.lang().gallery.loading_message.contributors, route: '/contributors/all', key: 'contributors' }
      ]

      if (this.current.resolution !== '16x') {
        params.push(
          { message: this.$root.lang().gallery.loading_message.contributions, route: '/contributions/all', key: 'contributions' },
        )
      }

      this.fetchData(params, loadMessage)
    },
    fetchData(params, loadMessage) {
      this.dataJSON = {}

      this.loading = { status: false, comments: [], steps: params.length }
      if (loadMessage) this.loading.status = true

      params.forEach(param => {
        axios.get(param.route)
          .then(res => {
            this.loading.comments.push(param.message)
            this.dataJSON[param.key] = res.data
          })
          .catch(err => {
            console.error(err) // loading will never ends, as we don't add "comment" into the comment list
          })
          .finally(() => {
            if (this.loading.comments.length === this.loading.steps) {
              this.loading.status = false
              this.update()
            }
          })
      })
    },
    update() {
      this.displayedTextures = {}
      this.displayedResults = 20
      this.displayed = {
        paths: {},
        uses: {},
        textures: {},
        contributions: {
          c32: [],
          c64: []
        },
        contributors: {}
      }

      // set textures tags
      this.options.tags = ['All']
      this.dataJSON.tags.forEach(tag => {
        if (!this.options.tags.includes(tag)) this.options.tags.push(tag)
      })

      // if no data : no textures to display
      if (!this.dataJSON.paths) return;

      // starting with the last element of a texture, paths:
      this.dataJSON.paths.forEach(path => {
        if (path.versions.includes(this.version === 'latest' ? settings.versions[this.edition][0] : this.version)) {
          this.displayed.paths[path.id] = {
            versions: path.versions,
            path: path.path,
            useID: path.useID,
            pathID: path.id
          }
        }
      })

      // re-map array to be objects
      let tmp = this.dataJSON.uses
      this.dataJSON.uses = {}
      tmp.forEach(t => {
        this.dataJSON.uses[t.id] = {
          edition: t.editions[0],
          useID: t.id.toString(),
          textureID: t.textureID.toString()
        }
      })

      tmp = this.dataJSON.textures
      this.dataJSON.textures = {}
      tmp.forEach(t => {
        this.dataJSON.textures[t.id] = {
          name: t.name,
          tags: t.type,
          textureID: t.id
        }
      })

      // then we keep uses that are in paths
      Object.values(this.displayed.paths).forEach(path => {
        const useID = path.useID
        const use = this.dataJSON.uses[useID]
        if (use) this.displayed.uses[useID] = { ...use, useID: useID, pathID: path.pathID }
      })

      Object.values(this.displayed.uses).forEach(use => {
        const textureID = use.textureID
        const texture = this.dataJSON.textures[textureID]
        if (texture) this.displayed.textures[textureID] = { ...texture, textureID: textureID, useID: use.useID, pathID: use.pathID }
      })

      this.dataJSON.contributors.forEach(contributor => {
        this.displayed.contributors[contributor.id] = {
          username: contributor.username
        }
      })

      // stuff below are only available in faithful, not default resolution
      if (this.current.resolution === '16x') {
        this.displayedTextures = this.splittedTextures()
        return
      }

      Object.values(this.dataJSON.contributions).forEach(contribution => {
        if (!contribution.res || !contribution.textureID) return
        if (!this.displayed.contributions[contribution.res][contribution.textureID]) this.displayed.contributions[contribution.res][contribution.textureID] = []

        this.displayed.contributions[contribution.res][contribution.textureID].push({
          contributors: contribution.contributors,
          date: contribution.date
        })
      })

      this.displayedTextures = this.splittedTextures()
    },
    scroll() {
      window.onscroll = () => {
        let bottomOfWindow = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) + window.innerHeight === document.documentElement.offsetHeight

        if (bottomOfWindow) {
          this.displayedResults += 30
          this.$forceUpdate()
        }
      }
    },
    toTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  },
  mounted() {
    this.scroll()
  }
}