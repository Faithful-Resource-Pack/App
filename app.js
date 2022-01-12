/* global __dirname */

require('dotenv').config()

const express = require('express')
const fs = require('fs')
const path = require('path')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const port = process.env.PORT
const VERBOSE = (process.env.VERBOSE || 'false') === 'true'
const app = express()
const compliappURL = '/'

const contributorsBackend = require('./backend/contributor')
const contributionsBackend = require('./backend/contributions')
const contributionsStatsBackend = require('./backend/contributions-stats')
const texturesBackend = require('./backend/textures')
const usesBackend = require('./backend/uses')
const pathsBackend = require('./backend/paths')
const addonsBackend = require('./backend/addons')
const allCollection = require('./helpers/firestorm/all')
const settings = require('./resources/settings.json')
const { ID_FIELD } = require('./helpers/firestorm/index.js')
const contributionController = require('./backend/contribution/contribution.controller.js');
const filesController = require('./backend/files/files.controller');

// fetch settings from the database
const fetchSettings = async () => {
  fs.writeFileSync(
    path.join(path.join(process.cwd(), 'resources/'), 'settings.json'),
    JSON.stringify(await allCollection.settings.read_raw(), null, 0),
    { flag: 'w', encoding: 'utf-8' }
  )
}

fetchSettings()
setInterval(() => {
  fetchSettings()
}, 5000)

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
  extensions: ['html', 'xml', 'json']
}))
app.use('/api/discord', require('./api/discord'))

/**
 * @param {String} token  Discord access token
 * @param {String[]} roles Authorized roles to get access, only 1 of them is necessary
 * @returns {Promise<void>} Resolves if authed correctly
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

      return contributorsBackend.getUser(userID)
    })
    .then(user => {
      if (roles.length == 0) return Promise.resolve(user[ID_FIELD])

      let i = 0
      while (roles.length >= i) {
        if (user.type.includes(roles[i])) return Promise.resolve(user[ID_FIELD])
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

contributionController.configure(verifyAuth, app, postSuccess, errorHandler)
filesController.configure(verifyAuth, app, postSuccess, errorHandler, getSuccess)

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
  app.post('/review/addons/' + approvalKey, (req, res) => {
    verifyAuth(req.body.token, [settings.roles.admin.name])
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
 * Perms: only members+ can submit addons
 * -> to be a member, log in using Discord
 */
app.post('/addons/submit', function (req, res) {
  verifyAuth(req.body.token)
    .then(() => {
      return addonsBackend.submit(req.body.data)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: anyone
 */
app.post('/addons/edit', function (req, res) {
  verifyAuth(req.body.token)
    .then(userID => {
      return addonsBackend.edit(req.body.data, userID)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: anyone
 * TODO : ONLY AUTHORS & ADMINS CAN EDIT IT
 */
app.post('/addons/remove', function (req, res) {
  verifyAuth(req.body.token)
    .then(userID => {
      return addonsBackend.remove(req.body.id, userID)
    })
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

app.get('/addons/get/names', function (req, res) {
  addonsBackend.get(['name'])
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
    return
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
    return
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
    return
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
app.post('/contributors/change', (req, res) => {
  verifyAuth(req.body.token, [settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return contributorsBackend.change(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/contributors/add', (req, res) => {
  verifyAuth(req.body.token, [settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return contributorsBackend.add(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/contributors/remove', (req, res) => {
  verifyAuth(req.body.token, [settings.roles.admin.name, settings.roles.dev.name])
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

app.get('/contributions/all/', function (req, res) {
  contributionsBackend.contributions()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/contributions/stats/', function (req, res) {
  contributionsStatsBackend.stats()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/contributions/users/:searchterm', function (req, res) {
  contributorsBackend.searchUserByUsername(req.params.searchterm)
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
app.post('/textures/change', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return texturesBackend.change(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/textures/add', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return texturesBackend.addTextures(req.body.data)
    })
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

app.post('/textures/remove', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return texturesBackend.removeTextures(req.body.id)
    })
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *                    USES
 * ==========================================
 */

// POST
app.post('/uses/change', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return usesBackend.change(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/uses/add', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return usesBackend.add(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/uses/remove', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
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

app.get('/uses/all/', function (req, res) {
  usesBackend.uses()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *                   PATHS
 * ==========================================
 */

// POST
app.post('/paths/change', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return pathsBackend.change(req.body)
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

app.post('/paths/add', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
    .then(() => {
      return pathsBackend.add(req.body)
    })
    .then(postSuccess(res))
    .catch(errorHandler(res))
})

app.post('/paths/remove', (req, res) => {
  verifyAuth(req.body.token, [ settings.roles.admin.name, settings.roles.dev.name])
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

app.get('/paths/all/', function (req, res) {
  pathsBackend.path()
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

/**
 * ==========================================
 *                  GALLERY
 * ==========================================
 */

app.get('/gallery/dialog/:textureID', (req, res) => {
  let textureID

  if (isNaN(req.params.textureID)) return
  else textureID = req.params.textureID

  texturesBackend.getEverythingAbout(textureID)
    .then(getSuccess(res))
    .catch(errorHandler(res))
})

app.get('/gallery/:type/:edition/:version/:tag/:search?', (req, res) => {
  let type, edition, version, tag, search

  if (!['textures', 'paths', 'uses'].includes(req.params.type.toLowerCase())) return
  else type = req.params.type.toLowerCase()

  if (!settings.editions.map(el => el.toLowerCase()).includes(req.params.edition.toLowerCase())) return
  else edition = req.params.edition.toLowerCase()

  if (req.params.version === 'latest') req.params.version = settings.versions[edition][0]

  if (!settings.versions[edition].includes(req.params.version.toLowerCase())) return
  else version = req.params.version.toLowerCase()

  tag = req.params.tag || 'all'
  search = req.params.search || undefined

  pathsBackend.usesIDsFromVersion(version)
    .then(usesIDs => {
      if (usesIDs.length > 0) return usesBackend.texturesIDsFromEdition(edition, usesIDs)
      return usesIDs
    })
    .then(texturesIDs => {
      if (texturesIDs.length > 0) return texturesBackend.texturesIDsFromTags(tag, texturesIDs)
      return texturesIDs
    })
    .then(texturesIDs => {
      if (texturesIDs.length > 0 && search) return texturesBackend.texturesIDsFromSearch(texturesIDs, search)
      return texturesIDs
    })
    .then(texturesID => {
      if (texturesID.length == 0) return undefined

      switch (type) {
        case 'textures':
          return texturesBackend.searchKeys(texturesID)
        case 'paths':
          return pathsBackend.searchTextureID(texturesID)
        case 'uses':
          return usesBackend.searchTextureID([{
            field: "textureID",
            criteria: "in",
            value: texturesID
          }])
      }
    })
    .then(getSuccess(res))
    .catch(errorHandler(res))
})