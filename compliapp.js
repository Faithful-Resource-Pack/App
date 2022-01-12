/* global Vue, VueRouter, Vuetify, location, axios, fetch, marked */

Object.defineProperty(Object.prototype, 'isObject', {
  /**
   * @param {*} item to be tested
   * @returns {Boolean} true if the item is an JS Object
   */
  value: (item) => { return (item && typeof item === 'object' && !Array.isArray(item)) }
})

Object.defineProperty(Object.prototype, 'merge', {
  /**
   * @param {Object} target 
   * @param  {...Object} sources 
   */
  value: (target, ...sources) => {
    if (!sources.length) return target
    const source = sources.shift()

    if (Object.isObject(target) && Object.isObject(source)) {
      for (const key in source) {
        if (Object.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          Object.merge(target[key], source[key])
        }

        else Object.assign(target, { [key]: source[key] })
      }
    }

    return Object.merge(target, ...sources)
  }
})

window.settings = undefined

const routes = [
  { path: '/', redirect: '/profile/' }
]

const router = new VueRouter({ routes })

const ContributionPage = () => import('./pages/contribution/main.js')
const ContributorPage = () => import('./pages/contributor/main.js')
const ContributorStatsPage = () => import('./pages/contribution-stats/main.js')
const TexturePage = () => import('./pages/texture/main.js')
const ProfilePage = () => import('./pages/profile/main.js')
const AddonNewPage = () => import('./pages/addon/new.js')
const AddonSubmissionsPage = () => import('./pages/addon/submissions.js')
const ReviewAddonsPage = () => import('./pages/review/review_addons.js')
const ReviewTranslationsPage = () => import('./pages/review/review_translations.js')
const ModNewPage = () => import('./pages/modding/mods_new.js')
const ModpackNewPage = () => import('./pages/modding/modpacks_new.js')
const ModsPage = () => import('./pages/modding/mods.js')
const ModpacksPage = () => import('./pages/modding/modpacks.js')
const filesPage = () => import('./pages/files/pageFiles.js')
const GalleryPage = () => import('./pages/gallery/gallery.js')

const ALL_TABS_ROUTES = [
  {
    subtabs: [
      { routes: [{ path: '/profile', component: ProfilePage }] },
      { routes: [{ path: '/contributions-stats', component: ContributorStatsPage }] },
      { routes: [{ path: '/gallery', redirect: '/gallery/java/32x/latest/All/' }, { path: '/gallery/:edition/:resolution/:version/:tag/:search?', component: GalleryPage }] }
    ]
  },
  {
    subtabs: [
      { routes: [{ path: '/addons/submissions', component: AddonSubmissionsPage }] },
      { routes: [{ path: '/addons/new', component: AddonNewPage }] }
    ]
  },
  {
    subtabs: [
      { routes: [{ path: '/modding/mods/new', component: ModNewPage }] },
      { routes: [{ path: '/modding/modpacks/new', component: ModpackNewPage }] }
    ]
  },
  {
    subtabs: [
      { routes: [{ path: '/review/addons', component: ReviewAddonsPage }] },
      { routes: [{ path: '/review/translations', component: ReviewTranslationsPage }] }
    ]
  },
  {
    subtabs: [
      { routes: [{ path: '/contributions', component: ContributionPage }] },
      { routes: [{ path: '/contributors', redirect: '/contributors/all' }, { path: '/contributors/:type?/:name?', component: ContributorPage }] },
      { routes: [{ path: '/files', component: filesPage }] },
      { routes: [{ path: '/textures', redirect: '/textures/all' }, { path: '/textures/:type?/:name?', component: TexturePage }] },
      { routes: [{ path: '/modding/mods', component: ModsPage }] },
      { routes: [{ path: '/modding/modpacks', component: ModpacksPage }] }
    ]
  }
]

for (let i = 0; i < ALL_TABS_ROUTES.length; ++i) {
  const tab = ALL_TABS_ROUTES[i]
  tab.subtabs.forEach(subtab => {
    subtab.routes.forEach(route => {
      router.addRoute(route)
    })
  })
}

// convert-import
import enUS from './resources/strings/en_US.js'
import frFR from './resources/strings/fr_FR.js'
import deDE from './resources/strings/de_DE.js'

Vue.config.devtools = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

const EMPTY_USER = {
  avatar: '',
  banner: '',
  id: 0,
  username: '',
  email: '',
  roles: []
}

let lang_value // = undefined
const LANG_KEY = 'lang'
const LANG_DEFAULT = 'en'
const _get_lang = function () {
  lang_value = localStorage.getItem(LANG_KEY) || LANG_DEFAULT
  return lang_value
}
const _set_lang = function (val) {
  val = String(val)
  lang_value = val
  localStorage.setItem(LANG_KEY, val)
}

let ALL_TABS = [
  {
    label: 'user',
    subtabs: [
      { enabled: true, icon: 'mdi-account', to: '/profile', label: 'profile' },
      { enabled: true, icon: 'mdi-chart-timeline-variant', to: '/contributions-stats', label: 'statistics' },
      { enabled: true, icon: 'mdi-texture', to: '/gallery', label: 'gallery' }
    ]
  },
  {
    label: 'addons',
    subtabs: [
      { enabled: true, icon: 'mdi-folder-multiple', to: '/addons/submissions', label: 'submissions' },
      { enabled: true, icon: 'mdi-upload', to: '/addons/new', label: 'upload' }
    ]
  },
  {
    label: 'modding',
    subtabs: [
      { enabled: false, icon: 'mdi-pipe-wrench', to: '/modding/mods/new', label: 'mod' },
      { enabled: false, icon: 'mdi-memory', to: '/modding/modpacks/new', label: 'modpack' }
    ]
  },
  {
    label: 'review',
    subtabs: [
      { enabled: true, icon: 'mdi-puzzle', to: '/review/addons', label: 'addons' },
      { enabled: false, icon: 'mdi-translate', to: '/review/translations', label: 'translations' }
    ],
    roles: ['Administrator']
  },
  {
    label: 'database',
    subtabs: [
      { enabled: true, icon: 'mdi-file-multiple', to: '/contributions', label: 'contributions' },
      { enabled: true, icon: 'mdi-account-multiple', to: '/contributors', label: 'contributors' },
      { enabled: true, icon: 'mdi-file', to: '/files', label: 'files' },
      { enabled: true, icon: 'mdi-texture', to: '/textures', label: 'textures' },
      { enabled: false, icon: 'mdi-pipe-wrench', to: '/modding/mods', label: 'mods' },
      { enabled: false, icon: 'mdi-memory', to: '/modding/modpacks', label: 'modpacks' }
    ],
    roles: ['Developer', 'Administrator']
  }
]

// convert-import

window.v = undefined
axios.get('./resources/settings.json')
  .then(res => {
    window.settings = res.data
  }).then(() => {
    let ins = new Vue({
      router,
      el: '#app',
      data() {
        return {
          selectedLang: _get_lang(),
          langs: {
            en: enUS,
            fr: Object.merge({}, enUS, frFR),
            de: Object.merge({}, enUS, deDE),
          },
          window: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          user: EMPTY_USER,
          tabs: ALL_TABS,
          bg: 'transparent',
          snackbar: {
            show: false,
            message: '',
            color: '#222',
            timeout: 4000
          },
          drawer: false,
          atl: []
        }
      },
      watch: {
        selectedLang: function (newValue) {
          if (Object.keys(this.langs).includes(newValue)) _set_lang(newValue)
        }
      },
      computed: {
        /**
         * Check user perms & add (or not) tabs & routes following user perms
         * @returns all tabs to be added in the html
         */
        validsTabs: function () {
          const res = []
          const roles = this.userRoles

          for (let i = 0; i < this.tabs.length; i++) {
            let found = false

            const tab = this.tabs[i]
            tab.labelText = this.lang().global.tabs[this.tabs[i].label]?.title

            if (this.tabs[i].roles) {
              this.tabs[i].roles.forEach(role => {
                if (roles.includes(role)) found = true
              })
            } else found = true

            if (found) {
              res.push(this.tabs[i])
              this.tabs[i].subtabs.forEach(subtab => {
                subtab.labelText = this.lang().global.tabs[this.tabs[i].label]?.subtabs[subtab.label]
              })
            }
          }

          return res
        },
        year: function () {
          return new Date().getFullYear()
        },
        /**
         * Tell if the user is logged
         * @returns true if the user is logged
         */
        isUserLogged: function () {
          return this.user && this.user.id !== 0 && this.user.id != null
        },
        /**
         * Get in real time the roles of a user
         * @returns user discord roles
         */
        userRoles: function () {
          return this.user.roles
        },
        langBCP47: function () {
          const res = {
            en: 'en-US',
            fr: 'fr-FR',
            de: 'de-DE'
          }
          return res[this.selectedLang]
        },
      },
      methods: {
        lang: function () {
          return this.langs[this.selectedLang]
        },
        showSnackBar: function (message, color = '#222', timeout = 4000) {
          this.snackbar.message = message
          if (message.response && message.response.data && message.response.data.error) this.snackbar.message += ':\n' + message.response.data.error
          this.snackbar.color = color
          this.snackbar.timeout = timeout
          this.snackbar.show = true
        },
        logout: function () {
          this.user = EMPTY_USER
          window.localStorage.removeItem('auth')

          this.update()
        },
        logUser: function () {
          let auth
          try {
            auth = JSON.parse(window.localStorage.getItem('auth'))
          } catch (err) {
            auth = {}
          }

          this.user = Object.assign({}, this.user, auth)
        },
        fetchRoles: function () {
          if (!this.isUserLogged) return

          const data = JSON.parse(JSON.stringify(this.user))

          axios.post('/profile/roles', data)
            .then((res) => {
              this.user.roles = res.data
            })
            .catch(err => {
              console.error(err)
              const message = (err && err.response && err.response ? err.response.data.error : undefined) || err.message
              this.showSnackBar(`${err.message}: ${message}`, 'error')
            })
        },
        /**
         * Use this function in sub-components to check perms
         */
        checkPermissions: function () {
          console.log(this.$route)
          console.log(this.$router.options.routes)
        },
        compiledMarkdown: function (markdown) {
          if (markdown === null || !markdown) return ''
          return marked(markdown, { sanitize: true })
        },
        refreshToken: function () {
          const authStr = window.localStorage.getItem('auth')
          const auth = JSON.parse(authStr)
          const data = { refresh_token: auth.refresh_token }

          axios.post('/api/discord/refresh', data)
            .then(response => {
              return response.data
            })
            .then(json => {
              this.tokenCallback(json, auth)
            })
            .catch(err => {
              console.error(err)
              this.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
            })
        },
        update: function () {
          this.logUser()
          this.fetchRoles()
        },
        tokenCallback: function (accessJSON, auth = {}) {
          auth.expires_at = new Date((new Date()).getTime() + (accessJSON.expires_in * 1000) - 60000)
          auth.refresh_token = accessJSON.refresh_token
          auth.access_token = accessJSON.access_token

          window.localStorage.setItem('auth', JSON.stringify(auth))
          window.location.href = window.location.origin + window.location.pathname + window.location.hash
          this.emitConnected()
        },
        addToken(data) {
          data.token = this.user.access_token
          return data
        },
        emitConnected() {
          const authStr = window.localStorage.getItem('auth')
          if (!authStr) return

          const auth = JSON.parse(authStr)

          this.atl.forEach(lis => {
            lis(auth.access_token)
          })
        },
        addAccessTokenListener(listener) {
          this.atl.push(listener)
          if (this.isUserLogged) {
            const authStr = window.localStorage.getItem('auth')
            if (!authStr) return

            const auth = JSON.parse(authStr)

            listener(auth.access_token)
          }
        },
      },
      created: function () {
        const authStr = window.localStorage.getItem('auth')
        if (!authStr) return

        const auth = JSON.parse(authStr)
        if (!auth.expires_at) return

        const expires_at = new Date(auth.expires_at)
        if (new Date() > expires_at) return this.refreshToken(auth.refresh_token)

        setTimeout(() => {
          this.refreshToken(auth.refresh_token)
        }, Math.max(expires_at - 60000 - new Date(), 0))
      },
      mounted: function () {
        const urlSearchParams = new URLSearchParams(window.location.search)
        const auth = Object.fromEntries(urlSearchParams.entries())

        window.addEventListener('resize', () => {
          this.window.width = window.innerWidth
          this.window.height = window.innerHeight
        })

        if (auth.access_token && auth.refresh_token && auth.expires_in) {

          fetch('https://discord.com/api/users/@me', {
            headers: {
              authorization: `Bearer ${auth.access_token}`
            }
          })
            .then(response => response.json())
            .then(json => {
              auth.id = json.id
              auth.avatar = `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=1024`
              auth.banner = json.banner != null ? `https://cdn.discordapp.com/banners/${json.id}/${json.banner}?size=1024` : 'https://raw.githubusercontent.com/Compliance-Resource-Pack/Branding/main/banner/forest.png'
              auth.username = `${json.username}#${json.discriminator}`

              this.tokenCallback(auth, auth)
            })
            .catch(console.error)
        } else this.update()
      },
      vuetify: new Vuetify({
        theme: {
          dark: true,
          themes: {
            dark: {
              primary: '#fafafa',
              accent: '#5e3631',
              success: '#22a831'
            }
          }
        }
      })
    })

    if (Vue.config.devtools) {
      window.v = ins
    }
  })
