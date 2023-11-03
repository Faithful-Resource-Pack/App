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
const GalleryPage = () => import('./pages/gallery/gallery.js')
const SettingsPage = () => import('./pages/settings/settingsPage.js')
const DashboardPage = () => import('./pages/dashboard/dashboard.js')
const ReconnectPage = () => import('./pages/reconnect/reconnect.js')

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

const LANGS = {
  en: enUS
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

const AUTH_STORAGE_KEY = 'auth';
const MENU_KEY = 'menu_key';
const MENU_DEFAULT = false;

window.settings = undefined

const ALL_ROUTES = [
  { path: '/', redirect: '/dashboard/' },
  { path: '/reconnect', component: ReconnectPage},
]

const router = new VueRouter({ routes: ALL_ROUTES })

// `to` field in subtab will be the first route path
const ALL_TABS = [
  {
    label: 'user',
    subtabs: [{
      enabled: true, icon: 'mdi-view-dashboard', label: 'dashboard',
      unlogged: true,
      routes: [{ path: '/dashboard', component: DashboardPage }]
    }, {
      enabled: true, icon: 'mdi-account', label: 'profile',
      routes: [{ path: '/profile', component: ProfilePage }]
    }, {
      enabled: true, icon: 'mdi-chart-timeline-variant', label: 'statistics',
      unlogged: true,
      routes: [{ path: '/contributions-stats', component: ContributorStatsPage}]
    }, {
      enabled: true, icon: 'mdi-texture', label: 'gallery',
      unlogged: true,
      routes: [
        { path: '/gallery', redirect: '/gallery/java/32x/latest/all/'},
        { path: '/gallery/:edition/:resolution/:version/:tag/:search*', component: GalleryPage}
      ]
    }]
  },
  {
    label: 'addons',
    subtabs: [{
      enabled: true, icon: 'mdi-folder-multiple', label: 'submissions',
      routes: [{ path: '/addons/submissions', component: AddonSubmissionsPage }]
    }, {
      enabled: true, icon: 'mdi-upload', label: 'upload',
      routes: [
        { path: '/addons/new', component: AddonNewPage },
        { path: '/addons/edit/:id', component: AddonEditPage }
      ]
    }]
  },
  {
    label: 'review',
    subtabs: [{
      enabled: true, icon: 'mdi-puzzle', label: 'addons', badge: '/addons/pending',
      routes: [{ path: '/review/addons', component: ReviewAddonsPage }]
    }, {
      enabled: true, icon: 'mdi-translate', label: 'translations',
      routes: [{
        path: '/review/translations', component: ReviewTranslationsPage,
        beforeEnter() {
          window.location.href = 'https://translate.faithfulpack.net/';
        }
      }]
    }],
    roles: ['Administrator']
  },
  {
    label: 'database',
    subtabs: [{
      enabled: true, icon: 'mdi-file-multiple', label: 'contributions',
      routes: [{ path: '/contributions', component: ContributionPage }]
    }, {
      enabled: true, icon: 'mdi-account-multiple', label: 'users',
      routes: [
        { path: '/users', redirect: '/users/all' },
        { path: '/users/:type?/:name*', component: UsersPage }
      ]
    }, {
      enabled: true, icon: 'mdi-texture', label: 'textures',
      routes: [
        { path: '/textures', redirect: '/textures/all' },
        { path: '/textures/:type?/:name*', component: TexturePage }
      ]
    }, {
      enabled: true, icon: 'mdi-cog', label: 'settings',
      routes: [{ path: '/settings', component: SettingsPage }]
    }],
    roles: ['Developer', 'Administrator']
  }
]

// add all tabs routes unlogged
ALL_TABS.filter(t => t.roles === undefined)
  .map(t => t.subtabs).flat(1).filter(s => s.unlogged)
  .map(s => s.routes).flat(1)
  .forEach(r => {
    router.addRoute(r)
  })

Vue.config.devtools = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

window.v = undefined
axios.get(`${window.apiURL}/settings/raw`)
  .then(res => {
    window.settings = res.data
  }).then(() => {
    const pinia = Pinia.createPinia();

    Vue.use(pinia);
    Vue.use(VueTippy);
    Vue.component("tippy", VueTippy.TippyComponent);

    let ins = new Vue({
      router,
      el: '#app',
      data() {
        let discordUser = discordUserStore()
        discordUser.params(window.env?.DISCORD_USER_URL)

        return {
          discordAuth: discordAuthStore(),
          discordUser,
          appUser: appUserStore(),
          badges: {},
          colors: colors,
          dark: undefined,
          vapiURL: window.apiURL,
          selectedLang: _get_lang(),
          langs: LANGS,
          languages: LANGUAGES,
          window: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          tabs: ALL_TABS.map(t => {
            t.subtabs = t.subtabs.map(s => {
              s.to = s.routes[0].path
              return s
            })
            return t
          }),
          bg: 'transparent',
          snackbar: {
            show: false,
            message: '',
            submessage: '',
            color: '#222',
            timeout: 4000,
            json: undefined
          },
          drawer: localStorage.getItem(MENU_KEY) ? localStorage.getItem(MENU_KEY) === 'true' : MENU_DEFAULT,
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
            _set_lang(newValue)
            if (Object.keys(this.langs).includes(newValue)) {

              if (Object.keys(this.langs).includes(oldValue)) {
                moment.locale(this.langBCP47)
                this.$forceUpdate()
              }
            } else {
              this.loadLanguage(newValue)
            }
          },
          immediate: true
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
        },
        drawer: function(n) {
          localStorage.setItem(MENU_KEY, String(n))
        },
        isUserLogged: function(n) {
          if(!n) return;

          // add all routes with no role
          ALL_TABS.filter(t => t.roles === undefined)
            .map(t => t.subtabs).flat(1).filter(s => !s.unlogged)
            .map(s => s.routes).flat(1)
            .forEach(r => {
              router.addRoute(r)
            })
        },
        userRoles: function(n, o) {
          if(o === undefined || o.length === undefined) return
          if(n.length === undefined) return
          // only update routes based on your roles fetched (role list is longer)
          // leave if new role list is shorter or equal
          if(n.length <= o.length) return

          // add all routes with matching roles
          const subtabs = ALL_TABS.filter(t => {
              if(t.roles === undefined) return false

              let allowed = false
              let i = 0
              while(i < t.roles.length && !allowed) {
                allowed = n.includes(t.roles[i])
                i++;
              }

              return allowed
            })
            .map(t => t.subtabs).flat(1).filter(s => !s.unlogged)
          subtabs.forEach(s => {
            if(s.badge) {
              this.loadBadge(s.badge)
            }
          })

          subtabs
            .map(s => s.routes).flat(1)
            .forEach(r => {
              router.addRoute(r)
            })
        }
      },
      computed: {
        user: function() {
          return {
            access_token: this.discordAuth.access_token,

            avatar: this.discordUser.discordAvatar,
            banner: this.discordUser.discordBanner,

            id: this.appUser.appUserId,
            username: this.discordUser.discordName,
            roles: this.appUser.appUserRoles || [],
          }
        },
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
          return this.user && this.user.id && this.user.id !== undefined
        },
        /**
         * Tell if the user is an admin
         * @returns true if user has damin role
         */
        isAdmin: function() {
          // if not logged in
          if(!this.isUserLogged) return false

          // if user not loaded
          if(!this.user) return false

          // check roles
          return this.user.roles.includes('Administrator')
        },
        /**
         * Get in real time the roles of a user
         * @returns user discord roles
         */
        userRoles: function () {
          return this.user.roles
        },
        langBCP47: function () {
          return this.lang_to_bcp47(this.selectedLang)
        },
        isDark: function () {
          return this.$vuetify.theme.dark
        }
      },
      methods: {
        lang_to_bcp47: function(lang) {
          return LANGUAGES.filter(l => l.lang === lang)[0]?.bcp47
        },
        loadLanguage: function(language) {
          const lang = this.languages.filter(l => l.lang === language)[0]

          if(!lang) return

          moment.locale(lang.bcp47)

          if(this.langs[lang.lang]) {
            return // everything will update
          }

          import(lang.file)
            .then(r => {
              r = r.default
              console.log(r)
              this.langs[lang.lang] = Object.merge({}, enUS, r)
              // we need to wait for this.langs to be updated
              this.$nextTick(() => {
                // then we have to force update because this.lang is a method
                this.$forceUpdate()
              })
            })
            .catch(e => {
              this.showSnackBar(e.toString(), "error")
            })
        },
        loadBadge: function(url) {
          axios.get(this.apiURL + url, this.apiOptions)
            .then(r => {
              const res = r.data;
              let val;
              if(Array.isArray(res) && res.length) {
                val = res.length
              } else if(res.length) {
                val = res.length
              } else {
                val = 0
              }
              Vue.set(this.badges, url, val);
            })

          if(this.isAdmin) {
            setTimeout(() => {
              if(this.admin) {
                this.loadBadge(url)
              }
            }, 15000);
          }
        },
        lang: function (path, raw = false) {
          let response = this.langs[this.selectedLang]

          // fallback to default when loading new language
          if(response === undefined) response = this.langs[Object.keys(this.langs)[0]]

          // if you didn't request a path then 0
          if(path === undefined) return response

          let split = path.split('.')

          while(response !== undefined && split.length > 0) {
            response = response[split.shift()]
          }

          // warns user if string not found
          if(response === undefined) {
            console.warn(`Cannot find ${raw ? 'data' : 'string'} for "` + path + '"')
          }

          // if raw we can use the object directly after
          if (raw)
            return response

          // Shall send string to be chained with other string operations
          return String(response) // enforce string to ensure string methods used after
        },
        jsonSnackBar: function (json = undefined) {
          const that = this
          return {
            showSnackBar: function () {
              let all_args = [...arguments]
              if (all_args.length < 2) all_args.push('#222')
              if (all_args.length < 3) all_args.push(4000)
              all_args.push(json)

              return that.showSnackBar(...all_args)
            }
          }
        },
        showSnackBar: function (message, color = '#222', timeout = 4000, json = undefined) {
          this.snackbar.submessage = ''
          if(typeof message === 'string') {
            let newline = message.indexOf('\n')
            if(newline !== -1) {
              this.snackbar.message = message.substring(0, newline) + ':'
              this.snackbar.submessage = message.substring(newline+1)
            } else {
              this.snackbar.message = message
            }
          }
          else {
            this.snackbar.message = message?.message

            if (message.response && message.response.data) {
              let submessage = message.response.data.error || message.response.data.message
              this.snackbar.message += ':'
              this.snackbar.submessage = submessage
            }
          }

          this.snackbar.json = json
          this.snackbar.color = color
          this.snackbar.timeout = timeout
          this.snackbar.show = true
        },
        logout: function () {
          this.discordAuth.logout()
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
        addToken(data) {
          data.token = this.user.access_token
          return data
        },
        emitConnected() {
          this.atl.forEach(lis => {
            lis(this.user.access_token)
          })
        },
        addAccessTokenListener(listener) {
          this.atl.push(listener)
          if (this.isUserLogged) {
            listener(this.user.access_token)
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
      beforeCreate() {
        pinia._a = this
      },
      created: function () {
        moment.locale(this.lang_to_bcp47(_get_lang()))

        this.discordAuth.begin(window.location.search, localStorage.getItem(AUTH_STORAGE_KEY))
        .then(() => {
          window.location.search = ''
        })
        .catch((err) => {
          if(!err.message.includes('auth method'))
            this.showSnackBar(err, 'error', 3000)
        })
        this.discordUser.watchDiscordAuth(this.discordAuth, (err) => {
          this.showSnackBar(err, 'error', 3000)
        })
        this.appUser.watchDiscordAuth(this.discordAuth, this.apiURL, (err) => {
          this.showSnackBar(err, 'error', 3000)
        })

        this.discordAuth.$subscribe(() => {
          if(this.discordAuth.access_token === undefined) {
            // remove
            window.localStorage.removeItem(AUTH_STORAGE_KEY)
            this.emitConnected()
          } else {
            if(Vue.config.devtools) console.log(this.discordAuth.access_token)
            // persist
            window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.discordAuth.$state))
            setTimeout(() => {
              this.discordAuth.refresh()
            }, (new Date(this.discordAuth.expires_at).getTime()) - (new Date().getTime()))
          }
        })

        window.eventBus = new Vue()
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
        window.addEventListener('resize', () => {
          this.window.width = window.innerWidth
          this.window.height = window.innerHeight
        })
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
