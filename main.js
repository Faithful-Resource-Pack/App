/* global __dirname */

require('dotenv').config()

const express = require('express')
const fs = require('fs')
const path = require('path')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const port = process.env.PORT
const VERBOSE = (process.env.VERBOSE || 'false') === 'true'
const DEV = (process.env.DEV || 'false') === 'true'
const API_URL = process.env.API_URL || 'https://api.faithfulpack.net/v2'
const app = express()
app.disable('x-powered-by');
const webappURL = '/'

const texturesBackend = require('./backend/textures')
const pathsBackend = require('./backend/paths')
const settings = require('./resources/settings.json')
const { default: axios } = require('axios');

// fetch settings from the API
const SETTINGS_PATH = path.join(path.join(process.cwd(), 'resources/'), 'settings.json')

if(!process.env.NO_REFRESH || process.env.NO_REFRESH !== 'true') {
  const fetchSettings = () => {
    axios.get(`${API_URL}/settings/raw`)
      .then(res => {
        const result = JSON.stringify(res.data)
        return fs.promises.writeFile(SETTINGS_PATH, result, {
          flag: 'w',
          encoding: 'utf-8'
        })
      })
  }

  fetchSettings()
  setInterval(() => {
    fetchSettings()
  }, 5000)
} else {
  console.info('no refresh');
}

process.on('unhandledRejection', (reason, promise) => {
  console.error(reason);
  console.trace(promise);
});

app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}))
app.use(express.json({ limit: '50mb' }))

app.get(webappURL, async (req, res) => {
  let file = fs.readFileSync('./index.html', 'utf8')

  const WINDOW_ENV = {
    DISCORD_USER_URL: process.env['DISCORD_USER_URL'] || undefined
  }

  file = file.replace('</head>',
      `  <script>\n`
    + `    window.apiURL = '${API_URL}'\n`
    + `    window.env = ${JSON.stringify(WINDOW_ENV)}\n`
    + `  </script>\n</head>`)

  // change Vue to dev version for devtools
  if(DEV) {
    file = file.replace('/vue.min.js', '/vue.js')
    file = file.replace('vuetify.min.js', 'vuetify.js')
    file = file.replace('/pinia.iife.min.js', '/pinia.iife.js')
  }

  if (DEV && process.env.BROWSER_REFRESH_URL) {
    file = file.replace('</body>', `<script src="${process.env.BROWSER_REFRESH_URL}"></script></body>`)
  }

  let langs = await getLanguages().catch(errorHandler(res))

  file = file.replace('</body>', '<script>const LANGUAGES = ' + JSON.stringify(langs) + '</script></body>')

  res.send(file)
})

app.listen(port, () => {
  console.log(`API url at ${API_URL}`);
  console.log(`Listening at http://localhost:${port}`)
  console.log(`Web App at http://localhost:${port}${webappURL}`)

  if (DEV && process.send) {
      process.send('online')
  }
})

// https://www.techonthenet.com/js/language_tags.php
const langPath = ['resources', 'strings'];
const languagesPath = path.join(__dirname, ...langPath);
const getLanguages = function() {
  return fs.promises.readdir(languagesPath)
    .then(files => {
      const result = files.filter(f => f.endsWith('js'))
        .map(e => {
          const name = e.split('.').slice(0, -1).join('.')
          return {
            lang: name.includes('en') ? 'en' : name.slice(-2).toLowerCase(),
            bcp47: name.replace('_', '-'),
            file: ["", ...langPath, e].join("/")
          }
        })

      return result
    })
}

app.use(express.static('.', {
  extensions: ['html', 'xml', 'json']
}))
app.use('/api/discord', require('./api/discord'))

/**
 * @param {String} token  Discord access token
 * @param {String[]} roles Authorized roles to get access, only 1 of them is necessary
 * @returns {Promise<void>} Resolves if authored correctly
 */
const verifyAuth = (token, roles = []) => {
  if (!token) {
    const err = new Error('No Discord Access Token given')
    err.code = 499
    return Promise.reject(err)
  }

  if (roles.length) roles.push(settings.roles.dev.name) // add dev perms for testing purpose

  return fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(json => {
      const userID = json.id

      return axios.get(`${API_URL}/users/${userID}`, {
        headers: {
          discord: token
        }
      }).then(r => r.data)
    })
    .then(user => {
      if (roles.length == 0) return Promise.resolve(user.id)

      for (let i = 0; roles.length >= i; ++i)
        if ((user.roles || user.type).includes(roles[i])) return Promise.resolve(user.id)

      const err = new Error('You don\'t have the permission to do that!')
      err.code = 403
      return Promise.reject(err)
    })
}

/**
 * Error handling generic for all request
 * @param {Response<any, Record<string, any>, number>} res
 * @return {Function}
 */
const errorHandler = function (res) {
  return (err) => {
    // advance parsing for axios errors and custom codes errors
    const code = (err.response ? err.response.status : err.code) || 400
    const message = (err.response && err.response.data ? err.response.data.error : err.message) || err

    if (VERBOSE) {
      console.error(code, message)
      console.error(err.stack)
    }
    res.status(code)
    res.send({ error: `${message}` })
    res.end()
  }
}

/**
 * Success handling for POST request
 * @param {import('express').Response<any, Record<string, any>, number>} res
 * @return {Function}
 */
const postSuccess = function (res) {
  return (result) => {
    res.status(200)
    if(result) res.send(result)
    res.end()
  }
}

/**
 * ==========================================
 *                 TEXTURES
 * ==========================================
 */

/**
 * Perms: admins + dev
 */
app.post('/textures/add', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => texturesBackend.addTextures(req.body.data))
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/textures/versions/add', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return texturesBackend.addNewMinecraftVersion(req.body.data)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/paths/version-update/', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return pathsBackend.update(req.body.actual, req.body.new)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})
