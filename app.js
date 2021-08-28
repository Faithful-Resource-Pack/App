/* global __dirname */

require('dotenv').config()

const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const port = process.env.PORT
const app = express()
const compliappURL = '/'

const settings = require('./resources/settings.js')

const contributorsBackend = require('./backend/contributor')
const contributionsBackend = require('./backend/contributions')
const contributionsStatsBackend = require('./backend/contributions-stats')
const texturesBackend = require('./backend/textures')
const usesBackend = require('./backend/uses')
const pathsBackend = require('./backend/paths')
const addonsBackend = require('./backend/addons')

app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}))
app.use(express.json({ limit: '50mb' }))

app.get(compliappURL, (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
  console.log(`Web app at http://localhost:${port}${compliappURL}`)
})

app.use(express.static('.', {
  extensions: ['html', 'xml']
}))
app.use('/api/discord', require('./api/discord'))

/**
 * @param {String} token  Discord access token
 * @param {String[]} roles Authorized roles to get access, only 1 of them is necessary
 * @returns {Promise<void>} Resolves if authed correctly
 */
const verifyAuth = function (token, roles = []) {
  if (!token) {
    const err = new Error('No Discord Access Token given')
    err.code = 499
    return Promise.reject(err)
  }

  roles.push('Developer') // add dev perms for testing purpose

  return fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(json => {
      const userID = json.id

      return contributorsBackend.getUser(userID)
    })
    .then(user => {
      let i = 0
      while (roles.length >= i) {
        if (user.type.includes(roles[i])) return Promise.resolve()
        i++
      }

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
    console.error(err)
    res.status(err.code || 400)
    res.send({ error: `${err.message || err}` })
    res.end()
  }
}

/**
 * Success handling for POST request
 * @param {Response<any, Record<string, any>, number>} res
 * @return {Function}
 */
const postSuccess = function (res) {
  return () => {
    res.status(200)
    res.end()
  }
}

/**
 * Success handling for GET request
 * @param {Response<any, Record<string, any>, number>} res
 * @return {Function}
 */
const getSuccess = function (res) {
  return (val) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
    res.end()
  }
}

/**
 * ==========================================
 *                   REVIEW
 * ==========================================
 */

// POST
/**
 * Perms: admins
 */
const APPROVAL_NAMES = {
  deny: 'denied',
  approve: 'approved'
}

Object.keys(APPROVAL_NAMES).forEach(approvalKey => {
  app.post('/review/addons/' + approvalKey, function (req, res) {
    verifyAuth(req.body.token, settings.ADMIN_ROLE)
      .then(() => {
        return addonsBackend.approval(req.body.approval, APPROVAL_NAMES[approvalKey], req.body.id)
      })
      .then(postSuccess(res))
      .catch(errorHandler(res))
  })
})

/**
 * ==========================================
 *                   ADD-ONS
 * ==========================================
 */

// POST
/**
 * Perms: anyone
 */
app.post('/addons/submit', function (req, res) {
  addonsBackend.submit(req.body)
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: anyone
 */
app.post('/addons/edit', function (req, res) {
  addonsBackend.edit(req.body)
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: anyone
 */
app.post('/addons/remove', function (req, res) {
  addonsBackend.remove(req.body.id)
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

// GET
app.get('/addons/search/author', function (req, res) {
  const params = req.query
  const authorID = params.authorID

  addonsBackend.search(authorID, 'author')
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

const approvalStatus = ['pending', 'denied', 'approved']
approvalStatus.forEach(approvalKey => {
  app.get('/addons/search/' + approvalKey, function (req, res) {
    addonsBackend.search(approvalKey, 'status')
      .then(getSuccess(res))
      .catch(errorHandler(res))
  })
})

app.get('/addons/get/titles', function (req, res) {
  addonsBackend.get(['title'])
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *                   PROFILE
 * ==========================================
 */

// POST
/**
 * Perms: self
 */
app.post('/profile/set', function (req, res) {
  if (!req.body.access_token) {
    res.status(400)
    res.end()
  }

  fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `Bearer ${req.body.access_token}`
    }
  })
    .then(response => response.json())
    .then(json => {
      const data = req.body
      data.id = json.id

      contributorsBackend.change(data)
        .then(postSuccess(res))
        .catch(err => {
          res.status(500)
          res.send(err)
          res.end()
        })
    })
})

/**
 * Perms: self
 */
app.post('/profile/get', function (req, res) {
  if (!req.body.access_token) {
    res.status(400)
    res.end()
  }

  let userID

  fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `Bearer ${req.body.access_token}`
    }
  })
    .then(response => response.json())
    .then(json => {
      userID = json.id
      contributorsBackend.getUser(userID)
        .then(getSuccess(res))
        .catch(err => {
          res.status(500)
          res.send(err)
          res.end()
        })
    })
})

/**
 * Perms: self
 */
app.post('/profile/roles', function (req, res) {
  if (!req.body.access_token) {
    res.status(400)
    res.end()
  }

  let userID

  fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `Bearer ${req.body.access_token}`
    }
  })
    .then(response => response.json())
    .then(json => {

      userID = json.id
      username = json.username
      
      contributorsBackend.getUser(userID)
        .then(contributor => {
          res.setHeader('Content-Type', 'application/json')
          res.send(contributor.type || [])
          res.end()
        })
        .catch(err => {

          // if user not found -> does not exist -> add a new one to the db
          contributorsBackend.add({
            username: username,
            type: [],
            media: [],
            id: userID
          })
          .then(() => {
            contributorsBackend.getUser(userID)
              .then(contributor => {
                res.setHeader('Content-Type', 'application/json')
                res.send(contributor.type || [])
                res.end()
              })
          })
          .catch(err => {
            res.status(500)
            res.send(err)
            res.end()
          })
        })
    })
})

/**
 * ==========================================
 *                CONTRIBUTOR
 * ==========================================
 */

// POST
/**
 * Perms: admins + dev
 */
app.post('/contributors/change', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return contributorsBackend.change(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/contributors/add', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return contributorsBackend.add(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/contributors/remove', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return contributorsBackend.remove(req.body.id)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

// GET
app.get('/contributors/types', function (req, res) {
  contributorsBackend.userTypes()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/contributors/:type/:name?/?', function (req, res) {
  let username, type

  if ('type' in req.params && req.params.type && req.params.type !== 'all') type = req.params.type
  if ('name' in req.params && req.params.name) username = req.params.name // check if field and value not undefined

  const searchOptions = [{
    field: 'username',
    criteria: 'includes',
    value: username || ''
  }]

  if (type) {
    searchOptions.push({
      field: 'type',
      criteria: 'array-contains-any',
      value: [type, type.toLowerCase(), type.toUpperCase()]
    })
  }

  contributorsBackend.search(searchOptions)
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *               CONTRIBUTIONS
 * ==========================================
 */

app.get('/contributions/res/?', function (req, res) {
  contributionsBackend.resolutions()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/contributions/authors/?', function (req, res) {
  contributionsBackend.authors()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/contributions/get/', function (req, res) {
  const params = req.query

  const authors = params.authors
  const resolutions = params.resolutions.includes('all') ? undefined : params.resolutions

  contributionsBackend.search(authors, resolutions)
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/contributions/stats/', function (req, res) {
  contributionsStatsBackend.stats()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *                 TEXTURES
 * ==========================================
 */

// POST
/**
 * Perms: admins + dev
 */
app.post('/textures/change', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return texturesBackend.change(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/textures/add', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return texturesBackend.addTextures(req.body.data)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/textures/versions/add', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return texturesBackend.addNewMinecraftVersion(req.body.data)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

// GET
app.get('/textures/all/?', function (req, res) {
  texturesBackend.textures()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/textures/types', function (req, res) {
  texturesBackend.textureTypes()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/textures/editions', function (req, res) {
  texturesBackend.textureEditions()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/textures/versions', function (req, res) {
  texturesBackend.textureVersions()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/textures/:type/:name?/?', function (req, res) {
  let name, type

  if ('type' in req.params && req.params.type && req.params.type !== 'all') type = req.params.type
  if ('name' in req.params && req.params.name) name = req.params.name // check if field and value not undefined

  texturesBackend.search(name, type)
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *                    USES
 * ==========================================
 */

// POST
app.post('/uses/change', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return usesBackend.change(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/uses/add', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return usesBackend.add(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/uses/remove', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return usesBackend.remove(req.body.id, req.body.deletePaths)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

// GET
app.get('/uses/search/', function (req, res) {
  const params = req.query
  const textureID = params.textureID

  usesBackend.search(textureID)
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *                   PATHS
 * ==========================================
 */

// POST
app.post('/paths/change', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return pathsBackend.change(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/paths/version-update/', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return pathsBackend.update(req.body.actual, req.body.new)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/paths/add', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return pathsBackend.add(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/paths/remove', function (req, res) {
  verifyAuth(req.body.token, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
    .then(() => {
      return pathsBackend.remove(req.body.id)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

// GET
app.get('/paths/search/', function (req, res) {
  const params = req.query
  const useID = params.useID

  pathsBackend.search(useID)
    .then(getSuccess(res))
    .catch(errorHandler(res))
})
