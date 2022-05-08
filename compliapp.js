/* global Vue, VueRouter, Vuetify, location, axios, fetch, marked */

const ContributionPage = () => import('./pages/contribution/main.js')
const UsersPage = () => import('./pages/users/main.js')
const ContributorStatsPage = () => import('./pages/contribution-stats/main.js')
const TexturePage = () => import('./pages/texture/main.js')
const ProfilePage = () => import('./pages/profile/main.js')
const AddonNewPage = () => import('./pages/addon/newAddonForm.js')
const AddonEditPage = () => import('./pages/addon/editAddonForm.js')
const AddonSubmissionsPage = () => import('./pages/addon/submissions.js')
const ReviewAddonsPage = () => import('./pages/review/review_addons.js')
const ReviewTranslationsPage = () => import('./pages/review/review_translations.js')
const ModNewPage = () => import('./pages/modding/mods_new.js')
const ModpackNewPage = () => import('./pages/modding/modpacks_new.js')
const ModsPage = () => import('./pages/modding/mods.js')
const ModpacksPage = () => import('./pages/modding/modpacks.js')
const filesPage = () => import('./pages/files/pageFiles.js')
const GalleryPage = () => import('./pages/gallery/gallery.js')
const SettingsPage = () => import('./pages/settings/settingsPage.js')
const DashboardPage = () => import('./pages/dashboard/dashboard.js')

window.colors = (await import('https://cdn.jsdelivr.net/npm/vuetify@2.6.4/lib/util/colors.min.js')).default
window.colorToHex = function(color) {
  const color_arr = color.trim().split(' ')

  try {
    color_arr[0] = color_arr[0].replace(/-./g, x=>x[1].toUpperCase())
    if(color_arr.length > 1) color_arr[1] = color_arr[1].replace('-', '')
    return colors[color_arr[0]][color_arr.length > 1 ? color_arr[1] : 'base']
  } catch (error) {
    return 'currentcolor'
  }
}
window.updatePageStyles = function(cmp) {
  if(!cmp.$el) return
  if(!cmp.$el.id) cmp.$el.id = cmp.name

  const pageId = cmp.$el.id
  const hex = colorToHex(cmp.pageColor)
  
  cmp.pageStyles = `<style>
  html.theme--light,
  html.theme--light .colored,
  html.theme--light .colored *,
  html.theme--light .v-menu__content,
  html.theme--light .v-menu__content *,
  html.theme--light #${pageId},
  html.theme--light #${pageId} * {
    scrollbar-color: ${hex} #ffffffbb !important;
  }

  html.theme--dark,
  html.theme--dark .colored,
  html.theme--dark .colored *,
  html.theme--dark .v-menu__content,
  html.theme--dark .v-menu__content *,
  html.theme--dark #${pageId},
  html.theme--dark #${pageId} * {
    scrollbar-color: ${hex} #000000bb;
  }
  </style>`
}

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

// languages section
import enUS from './resources/strings/en_US.js'
import frFR from './resources/strings/fr_FR.js'
import deDE from './resources/strings/de_DE.js'
import ptBR from './resources/strings/pt_BR.js'
import csCZ from './resources/strings/cs_CZ.js'

const LANGS = {
  en: enUS,
  cs: Object.merge({}, enUS, csCZ),
  br: Object.merge({}, enUS, ptBR),
  de: Object.merge({}, enUS, deDE),
  fr: Object.merge({}, enUS, frFR)
}

// https://www.techonthenet.com/js/language_tags.php
// Use for v-calendar date format
const LANGS_TO_BCP47 = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  br: 'pt-BR',
  cs: 'cs-CZ'
}

if(Object.keys(LANGS_TO_BCP47).sort().toString() !== Object.keys(LANGS).sort().toString()) {
  throw new Error(`langBCP47 keys don't match LANGS keys`)
}

function lang_to_bcp47(lang) {
  return LANGS_TO_BCP47[lang]
}

let lang_value;
const LANG_KEY = 'lang';
const LANG_DEFAULT = 'en';


const _get_lang = function () {
  lang_value = localStorage.getItem(LANG_KEY) || LANG_DEFAULT;
  
  return lang_value;
}

const _set_lang = function (val) {
  val = String(val);
  lang_value = val;
  localStorage.setItem(LANG_KEY, val);
}
///////////

window.settings = undefined

const routes = [
  { path: '/', redirect: '/dashboard/' }
]


const router = new VueRouter({ routes })

const ALL_TABS_ROUTES = [
  {
    subtabs: [
      { routes: [{ path: '/dashboard', component: DashboardPage}]},
      { routes: [{ path: '/profile', component: ProfilePage }] },
      { routes: [{ path: '/contributions-stats', component: ContributorStatsPage }] },
      { routes: [{ path: '/gallery', redirect: '/gallery/java/32x/latest/All/' }, { path: '/gallery/:edition/:resolution/:version/:tag/:search*', component: GalleryPage }] }
    ]
  },
  {
    subtabs: [
      { routes: [{ path: '/addons/submissions', component: AddonSubmissionsPage }] },
      { routes: [{ path: '/addons/new', component: AddonNewPage }] },
      { routes: [{ path: '/addons/edit/:id', component: AddonEditPage }] }
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
      { routes: [{ path: '/users', redirect: '/users/all' }, { path: '/users/:type?/:name*', component: UsersPage }] },
      { routes: [{ path: '/textures', redirect: '/textures/all' }, { path: '/textures/:type?/:name*', component: TexturePage }] },
      { routes: [{ path: '/settings', component: SettingsPage }] },
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

Vue.config.devtools = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

const EMPTY_USER = {
  avatar: '',
  banner: '',
  id: 0,
  username: '',
  email: '',
  roles: []
}

let ALL_TABS = [
  {
    label: 'user',
    subtabs: [
      { enabled: true, icon: 'mdi-view-dashboard', to: '/dashboard', label: 'dashboard' },
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
      { enabled: true, icon: 'mdi-translate', to: '/review/translations', label: 'translations' }
    ],
    roles: ['Administrator']
  },
  {
    label: 'database',
    subtabs: [
      { enabled: true, icon: 'mdi-file-multiple', to: '/contributions', label: 'contributions' },
      { enabled: true, icon: 'mdi-account-multiple', to: '/users', label: 'users' },
      { enabled: true, icon: 'mdi-texture', to: '/textures', label: 'textures' },
      { enabled: true, icon: 'mdi-settings', to: '/settings', label: 'settings' },
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
    Vue.use(VueCalendarHeatmap)

    let ins = new Vue({
      router,
      el: '#app',
      data() {
        return {
          colors: colors,
          dark: undefined,
          vapiURL: window.apiURL,
          selectedLang: _get_lang(),
          langs: LANGS,
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
          theme: undefined,
          themes: {
            dark: 'mdi-weather-night',
            system: 'mdi-theme-light-dark',
            light: 'mdi-white-balance-sunny',
          },
          atl: []
        }
      },
      watch: {
        selectedLang: {
          handler: function (newValue, oldValue) {
            if (Object.keys(this.langs).includes(newValue)) {
              _set_lang(newValue)

              if (Object.keys(this.langs).includes(oldValue)) {
                moment.locale(this.langBCP47)
                this.$forceUpdate()
              }
            }
          },
          immediate: true
        },
        user: {
          handler(n, o) {
            if (Vue.config.devtools && n.access_token && n.access_token !== o.access_token) {
              console.info(n.access_token)
            }
          },
          deep: true
        },
        dark: {
          handler(n, o) {
            if(o == undefined) {
              const isDark = window.localStorage.getItem('DARK_THEME')
              this.dark =  isDark === null ? true : isDark === "true"
              this.$vuetify.theme.dark = this.dark
            } else {
              if(n === false || n === true) {
                this.$vuetify.theme.dark = n
                window.localStorage.setItem('DARK_THEME', String(n))
              }
            }
          },
          immediate: true
        },
        theme: {
          handler(n) {
            const themes_available = Object.keys(this.themes)
            if(n == undefined) {
              let theme = window.localStorage.getItem('THEME')

              if(!themes_available.includes(theme)) {
                theme = themes_available[0]
              }

              this.theme = theme
              return
            } else {
              if(!themes_available.includes(n)) {
                this.theme = themes_available[0]
                return
              }
            }

            window.localStorage.setItem('THEME', String(n))
            const isDark = n != 'light' && (n == 'dark' || window.matchMedia("(prefers-color-scheme: dark)").matches)
            this.$vuetify.theme.dark = isDark
          },
          immediate: true
        },
        isDark: {
          handler: function(n) {
            let arr = ['theme--light', 'theme--dark']
            if (n == true) {
              arr = arr.reverse()
            }

            const html = document.querySelector('html')

            html.classList.add(arr[0])
            html.classList.remove(arr[1])
          },
          immediate: true
        }
      },
      computed: {
        apiURL: function() {
          if(Vue.config.devtools && this.vapiURL && this.vapiURL.includes('localhost') && window.location.host !== 'localhost')
            return this.vapiURL.replace('localhost', window.location.host)
          return this.vapiURL
        },
        apiOptions: function () {
          return {
            headers: { "discord": this.user.access_token }
          }
        },
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
        isDesktop: function () {
          return this.$vuetify.breakpoint.lgAndUp
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
          return lang_to_bcp47(this.selectedLang)
        },
        isDark: function () {
          return this.$vuetify.theme.dark
        }
      },
      methods: {
        lang: function (path) {
          let response = this.langs[this.selectedLang]
          if(path === undefined) return response

          let split = path.split('.')

          while(response !== undefined && split.length > 0) {
            response = response[split.shift()]
          }

          if(response === undefined) {
            console.warn('Cannot find string for "' + path + '"')
          }

          return String(response) // enforce string to ensure string methods used after
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
        onMediaChange(isDark) {
          // only if system theme
          if(this.theme === 'system') {
            this.$vuetify.theme.dark = isDark

            // nice snackbar sentence
            const notify = this.lang().global.snackbar_system_theme
            this.showSnackBar(notify.sentence.replace('%s', isDark ? notify.themes.dark : notify.themes.light), 'success', 2000)
          }
        }
      },
      created: function () {
        moment.locale(lang_to_bcp47(_get_lang()))
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
        // watch color schemes for light and dark
        window.matchMedia("(prefers-color-scheme: dark)").onchange = (ev) => {
          console.log(ev)
          if(ev.matches) this.onMediaChange(true)
        }
        window.matchMedia("(prefers-color-scheme: light)").onchange = (ev) => {
          console.log(ev)
          if(ev.matches) this.onMediaChange(false)
        }

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
              auth.avatar = json.avatar !== null ? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=1024` : null
              auth.banner = json.banner != null ? `https://cdn.discordapp.com/banners/${json.id}/${json.banner}?size=1024` : 'https://database.faithfulpack.net/images/branding/backgrounds/f32.png'
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
              primary: '#76C945',
              accent: '#5e3631',
              success: '#22a831'
            },
            light: {
              primary: '#76C945',
              secondary: '#00552B',
              accent: '#af0b51',
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
