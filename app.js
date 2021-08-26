/* global __dirname */

require('dotenv').config()

const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const port = process.env.PORT
const app = express()
const compliapp_url = '/';

const { settings } = require('./resources/settings.js')

const contributors_backend = require('./backend/contributor')
const contributions_backend = require('./backend/contributions')
// const contributions = require('./backend/contribution')
const contributionsStats_backend = require('./backend/contributions-stats')
const textures_backend = require('./backend/textures')
const uses_backend = require('./backend/uses')
const paths_backend = require('./backend/paths')
const addons_backend = require('./backend/addons')

app.use(express.urlencoded({
	extended: true,
	limit: '50mb'
}))
app.use(express.json({ limit: '50mb' }))

app.get(compliapp_url, (req, res) => {
	res.sendFile(path.join(__dirname, './index.html'))
})

app.listen(port, () => {
	console.log(`listening at http://localhost:${port}`)
	console.log(`Web app at http://localhost:${port}${compliapp_url}`)
})

app.use(express.static('.', {
	extensions: [ 'html', 'xml' ]
}))
app.use('/api/discord', require('./api/discord'))

/**
 * @param {String} accessToken  Discord access token
 * @param {String[]} roles Authorized roles to get access, only 1 of them is necessary
 * @returns {Promise<void>} Resolves if authed correctly
 */
const verifyAuth = function(accessToken, roles = []) {
	if (!accessToken) return Promise.reject(new Error('No Discord Access Token given'))

	roles.push('Developer') // add dev perms for testing purpose

	return fetch('https://discord.com/api/users/@me', {
		headers: {
			authorization: `Bearer ${accessToken}`
		}
	})
	.then(response => response.json())
	.then(json => {
		const userID = json.id

		return contributors_backend.getUser(userID)
	})
	.then(user => {
		let i = 0
		while (roles.length >= i) {
			if (user.type.includes(roles[i])) 
				return Promise.resolve()

			i++
		}
		
		let err = new Error('You don\'t have the permission to do that!')
		err.code = 403
		return Promise.reject(err)
	})
}

/**
 * Error handling generic for all request
 * @param {Response<any, Record<string, any>, number>} res
 * @return {Function}
 */
const errorHandler = function(res) {
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
const postSuccess = function(res) {
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
const getSuccess = function(res) {
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

Object.keys(APPROVAL_NAMES).forEach(approval_key => {
	app.post('/review/addons/' + approval_key, function (req, res) {
		verifyAuth(req.body.accessToken, settings.ADMIN_ROLE)
		.then(() => {
			return addons_backend.approval(req.body.approval, APPROVAL_NAMES[approval_keys], req.body.id)
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
	addons_backend.submit(req.body)
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

/**
 * Perms: anyone
 */
app.post('/addons/edit', function (req, res) {
	addons_backend.edit(req.body)
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

/**
 * Perms: anyone
 */
app.post('/addons/remove', function (req, res) {
	addons_backend.remove(req.body.id)
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

// GET
app.get('/addons/search/author', function (req, res) {
	const params = req.query
	const authorID = params.authorID

	addons_backend.search(authorID, 'author')
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

const approval_status = ['pending', 'denied', 'approved']
approval_status.forEach(approval_key => {
	app.get('/addons/search/' + approval_key, function (req, res) {
		addons_backend.search(approval_key, 'status')
		.then(getSuccess(res))
		.catch(errorHandler(res))
	})
})

app.get('/addons/get/titles', function (req, res) {
	addons_backend.get(["title"])
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
app.post('/profile/set', function(req, res) {
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
		let data = req.body
		data.id = json.id

		contributors_backend.change(data)
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
app.post('/profile/get', function(req, res) {
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
		contributors_backend.search([{ field: 'id', criteria: '==', 'value': json.id }])
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

	fetch('https://discord.com/api/users/@me', {
		headers: {
			authorization: `Bearer ${req.body.access_token}`
		}
	})
	.then(response => response.json())
	.then(json => {
		contributors_backend.search([{ field: 'id', criteria: '==', value: json.id}])
		.then(contributor => {
			res.setHeader('Content-Type', 'application/json')
			res.send(contributor[0].type)
		})
		.catch(err => {
			res.status(500)
			res.send(err)
			res.end()
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
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return contributors_backend.change(req.body)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/contributors/add', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return contributors_backend.add(req.body)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/contributors/remove', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return contributors_backend.remove(req.body.id)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

// GET
app.get('/contributors/types', function (req, res) {
	contributors_backend.userTypes()
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/contributors/:type/:name?/?', function (req, res) {
	let username, type

	if ('type' in req.params && req.params.type && req.params.type != 'all')
		type = req.params.type
	if ('name' in req.params && req.params.name) // check if field and value not undefined
		username = req.params.name

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

	contributors_backend.search(searchOptions)
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

/**
 * ==========================================
 *               CONTRIBUTIONS
 * ==========================================
 */

app.get('/contributions/res/?', function(req, res) {
	contributions_backend.resolutions()
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/contributions/authors/?', function(req, res) {
	contributions_backend.authors()
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/contributions/get/', function(req, res) {
	const params = req.query
	
	const authors = params.authors
	const resolutions = params.resolutions.includes('all') ? undefined : params.resolutions

	contributions_backend.search(authors, resolutions)
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/contributions/stats/', function(req, res) {
	contributionsStats_backend.stats()
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
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return textures_backend.change(req.body)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

/**
 * Perms: admins + dev
 */
app.post('/textures/add', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return textures_backend.addTextures(req.body.data)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})


// GET
app.get('/textures/all/?', function (req, res) {
	textures_backend.textures()
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/textures/types', function (req, res) {
	textures_backend.textureTypes()
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/textures/editions', function (req, res) {
	textures_backend.textureEditions()
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/textures/versions', function (req, res) {
	textures_backend.textureVersions()
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.get('/textures/:type/:name?/?', function (req, res) {
	let name, type

	if ('type' in req.params && req.params.type && req.params.type != 'all')
		type = req.params.type
	if ('name' in req.params && req.params.name) // check if field and value not undefined
		name = req.params.name

	textures_backend.search(name, type)
	.then(getSuccess(res))
	.catch(errorHandler(res))
})

app.post('/textures/versions/add', function (req, res) {
	verifyAuth(req.body.token, 'developer')
	.then(() => {
		return textures_backend.addNewMinecraftVersion(req.body.data)
	})
	.then(() => {
		res.status(200)
		res.end()
	})
	.catch(err => {
		console.error(err)
		res.status(400).send({
			error: '' + (err.message || err)
	 })
		res.end()
	})
})

/**
 * ==========================================
 *                    USES
 * ==========================================
 */

// POST
app.post('/uses/change', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return uses_backend.change(req.body)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

app.post('/uses/add', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return uses_backend.add(req.body)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

app.post('/uses/remove', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return uses_backend.remove(req.body.id, req.body.deletePaths)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

// GET
app.get('/uses/search/', function (req, res) {
	const params = req.query
	const textureID = params.textureID

	uses_backend.search(textureID)
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
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return paths_backend.change(req.body)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

app.post('/paths/version-update/', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return paths_backend.update(req.body.actual, req.body.new)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

app.post('/paths/add', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return paths_backend.add(req.body)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

app.post('/paths/remove', function (req, res) {
	verifyAuth(req.body.accessToken, [...settings.ADMIN_ROLE, ...settings.DEV_ROLE])
	.then(() => {
		return paths_backend.remove(req.body.id)
	})
	.then(postSuccess(res))
	.catch(errorHandler(res))
})

// GET
app.get('/paths/search/', function (req, res) {
	const params = req.query
	const useID = params.useID

	paths_backend.search(useID)
	.then(getSuccess(res))
	.catch(errorHandler(res))
})