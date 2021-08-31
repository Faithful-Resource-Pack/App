/* global Vue, VueRouter, Vuetify, location, axios, fetch, marked */

import enUS from './resources/strings/en_US.js'
import frFR from './resources/strings/fr_FR.js'
import deDE from './resources/strings/de_DE.js'

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

Vue.config.devtools = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

const routes = [
  { path: '/', redirect: '/profile/' }
]

const router = new VueRouter({ routes })

const EMPTY_USER = {
  avatar: '',
  banner: '',
  id: 0,
  username: '',
  email: '',
  roles: []
}

// eslint-disable-next-line no-unused-vars
const v = new Vue({
  router,
  el: '#app',
  data: {
    selectedLang: 'en',
    langs: {
      en: enUS,
      fr: { ...enUS, ...frFR },
      de: { ...enUS, ...deDE }
    },
    window: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    user: EMPTY_USER,
    tabs: [
      {
        label: 'user',
        subtabs: [
          { enabled: true, icon: 'mdi-account', to: '/profile', label: 'profile', routes: [{ path: '/profile', component: ProfilePage }] },
          { enabled: true, icon: 'mdi-chart-timeline-variant', to: '/contributions-stats', label: 'statistics', routes: [{ path: '/contributions-stats', component: ContributorStatsPage }] }
        ]
      },
      {
        label: 'addons',
        subtabs: [
          { enabled: true, icon: 'mdi-folder-multiple', to: '/addons/submissions', label: 'submissions', routes: [{ path: '/addons/submissions', component: AddonSubmissionsPage }] },
          { enabled: true, icon: 'mdi-upload', to: '/addons/new', label: 'upload', routes: [{ path: '/addons/new', component: AddonNewPage }] }
        ]
      },
      {
        label: 'modding',
        subtabs: [
          { enabled: false, icon: 'mdi-pipe-wrench', to: '/modding/mods/new', label: 'mod', routes: [{ path: '/modding/mods/new', component: ModNewPage }] },
          { enabled: false, icon: 'mdi-memory', to: '/modding/modpacks/new', label: 'modpack', routes: [{ path: '/modding/modpacks/new', component: ModpackNewPage }] }
        ]
      },
      {
        label: 'review',
        subtabs: [
          { enabled: true, icon: 'mdi-puzzle', to: '/review/addons', label: 'addons', routes: [{ path: '/review/addons', component: ReviewAddonsPage }] },
          { enabled: false, icon: 'mdi-translate', to: '/review/translations', label: 'translations', routes: [{ path: '/review/translations', component: ReviewTranslationsPage }] }
        ],
        roles: ['Administrator']
      },
      {
        label: 'database',
        subtabs: [
          { enabled: true, icon: 'mdi-file-multiple', to: '/contributions', label: 'contributions', routes: [{ path: '/contributions', component: ContributionPage }] },
          { enabled: true, icon: 'mdi-account-multiple', to: '/contributors', label: 'contributors', routes: [{ path: '/contributors', redirect: '/contributors/all' }, { path: '/contributors/:type?/:name?', component: ContributorPage }] },
          { enabled: true, icon: 'mdi-texture', to: '/textures', label: 'textures', routes: [{ path: '/textures', redirect: '/textures/all' }, { path: '/textures/:type?/:name?', component: TexturePage }] },
          { enabled: false, icon: 'mdi-pipe-wrench', to: '/modding/mods', label: 'mods', routes: [{ path: '/modding/mods', component: ModsPage }] },
          { enabled: false, icon: 'mdi-memory', to: '/modding/modpacks', label: 'modpacks', routes: [{ path: '/modding/modpacks', component: ModpacksPage }] }
        ],
        roles: ['Developer', 'Administrator']
      }
    ],
    bg: 'transparent',
    snackbar: {
      show: false,
      message: '',
      color: '#222',
      timeout: 4000
    },
    drawer: false
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

        this.tabs[i].labelText = this.lang().global.tabs[this.tabs[i].label]?.title

        if (this.tabs[i].roles) {
          this.tabs[i].roles.forEach(role => {
            if (roles.includes(role)) found = true
          })
        } else found = true

        if (found) {
          res.push(this.tabs[i])
          this.tabs[i].subtabs.forEach(subtab => {
            subtab.labelText = this.lang().global.tabs[this.tabs[i].label]?.subtabs[subtab.label]
            subtab.routes.forEach(route => {
              router.addRoute(route)
            })
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
    }
  },
  methods: {
    lang: function () {
      return this.langs[this.selectedLang]
    },
    showSnackBar: function (message, color = '#222', timeout = 4000) {
      this.snackbar.message = message
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
          this.showSnackBar(`${err.message}: ${err.response.data.error}`, 'error')
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
      return marked(markdown, { sanitize: true })
    },
    update: function () {
      this.logUser()
      this.fetchRoles()
    }
  },
  mounted: function () {
    const urlSearchParams = new URLSearchParams(window.location.search)
    const auth = Object.fromEntries(urlSearchParams.entries())

    window.addEventListener('resize', () => {
      this.window.width = window.innerWidth
      this.window.height = window.innerHeight
    })

    if (auth.access_token && auth.refresh_token) {
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

          window.localStorage.setItem('auth', JSON.stringify(auth))

          this.update()
        })
        .finally(() => {
          setTimeout(() => {
            window.location.search = ''
          }, 20)
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
