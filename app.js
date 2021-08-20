/* global __dirname */

require('dotenv').config()

const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const port = process.env.PORT
const app = express()
const compliapp_url = '/';

const contributors_backend = require('./backend/contributor')
const contributions_backend = require('./backend/contributions')
// const contributions = require('./backend/contribution')
const contributionsStats_backend = require('./backend/contributions-stats')
const textures_backend = require('./backend/textures')
const uses_backend = require('./backend/uses')
const paths_backend = require('./backend/paths')

app.use(express.urlencoded({
	extended: true
}))
app.use(express.json());

app.get(compliapp_url, (req, res) => {
	res.sendFile(path.join(__dirname, './index.html'))
})

app.listen(port, () => {
	console.log(`listening at http://localhost:${port}`)
	console.log(`Web app at http://localhost:${port}${compliapp_url}/`)
})

app.use(express.static('.', {
	extensions: [ 'html', 'xml' ]
}))
app.use('/api/discord', require('./api/discord'))

/**
 * @param {String} token  Discord access token
 * @param {String} role Role necessary to get authed
 * @returns Resolves if authed correctly
 */
const verifyAuth = function(token, role = 'Developer') {
	return Promise.reject(new Error('Not implemented'))
}

/**
 * ==========================================
 *                   PROFILE
 * ==========================================
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
		.then(() => {
			res.status(200)
		})
		.catch(err => {
			res.status(500)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
	})
})

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
		.then(contributor => {
			res.setHeader('Content-Type', 'application/json')
			res.send(contributor)
		})
		.catch(err => {
			res.status(500)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
	})
})

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
		})
		.finally(() => {
			res.end()
		})
	})

})

/**
 * ==========================================
 *                CONTRIBUTOR
 * ==========================================
 */

app.post('/contributor', function (req, res) {
	res.status(200)
	res.end()
})

app.get('/contributors/types', function (req, res) {
	contributors_backend.userTypes()
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
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
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
})

app.post('/contributors/change', function (req, res) {
	contributors_backend.change(req.body)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

app.post('/contributors/add', function (req, res) {
	contributors_backend.add(req.body)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

app.post('/contributors/remove', function (req, res) {
	contributors_backend.remove(req.body.id)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

/**
 * ==========================================
 *               CONTRIBUTIONS
 * ==========================================
 */

app.get('/contributions/res/?', function(req, res) {
	contributions_backend.resolutions()
	.then(val => {
		res.setHeader('Content-Type', 'application/json')
		res.send(val)
	})
	.catch(err => {
		console.trace(err)
		res.status(400)
		res.send(err)
	})
	.finally(() => {
		res.end()
	})
})

app.get('/contributions/authors/?', function(req, res) {
	contributions_backend.authors()
	.then(val => {
		res.setHeader('Content-Type', 'application/json')
		res.send(val)
	})
	.catch(err => {
		console.trace(err)
		res.status(400)
		res.send(err)
	})
	.finally(() => {
		res.end()
	})
})

app.get('/contributions/get/', function(req, res) {
	const params = req.query
	
	const authors = params.authors
	const resolutions = params.resolutions.includes('all') ? undefined : params.resolutions

	contributions_backend.search(authors, resolutions)
	.then(val => {
		res.setHeader('Content-Type', 'application/json')
		res.send(val)
	})
	.catch(err => {
		console.trace(err)
		res.status(400)
		res.send(err)
	})
	.finally(() => {
		res.end()
	})
})

app.get('/contributions/stats/', function(req, res) {
	contributionsStats_backend.stats()
	.then(val => {
		res.setHeader('Content-Type', 'application/json')
		res.send(val)
	})
	.catch(err => {
		console.trace(err)
		res.status(400)
		res.send(err)
	})
	.finally(() => {
		res.end()
	})
})

/**
 * ==========================================
 *                 TEXTURES
 * ==========================================
 */

app.get('/textures/all/?', function (req, res) {
	textures_backend.textures()
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.trace(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
})


app.get('/textures/types', function (req, res) {
	textures_backend.textureTypes()
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
})

app.get('/textures/editions', function (req, res) {
	textures_backend.textureEditions()
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
})

app.get('/textures/versions', function (req, res) {
	textures_backend.textureVersions()
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
})

app.get('/textures/:type/:name?/?', function (req, res) {
	let name, type

	if ('type' in req.params && req.params.type && req.params.type != 'all')
		type = req.params.type
	if ('name' in req.params && req.params.name) // check if field and value not undefined
		name = req.params.name

	textures_backend.search(name, type)
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
})

app.post('/textures/change', function (req, res) {
	textures_backend.change(req.body)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

app.post('/textures/add', function (req, res) {
	verifyAuth(req.body.token, 'developer')
	.then(() => {
		return textures_backend.addTextures(req.body.data)
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

app.post('/uses/change', function (req, res) {
	uses_backend.change(req.body)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

app.post('/uses/add', function (req, res) {
	uses_backend.add(req.body)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

app.get('/uses/search/', function (req, res) {
	const params = req.query
	const textureID = params.textureID

	uses_backend.search(textureID)
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end()
		})
})

app.post('/uses/remove', function (req, res) {
	uses_backend.remove(req.body.id, req.body.deletePaths)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

/**
 * ==========================================
 *                   PATHS
 * ==========================================
 */

app.post('/paths/change', function (req, res) {
	paths_backend.change(req.body)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

app.post('/paths/version-update/', function (req, res) {
	paths_backend.update(req.body.actual, req.body.new)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})

app.post('/paths/add', function (req, res) {
	paths_backend.add(req.body)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.statust(400)
			res.end()
		})
})

app.post('/paths/remove', function (req, res) {
	paths_backend.remove(req.body.id)
		.then(() => {
			res.status(200)
			res.end()
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.end()
		})
})


app.get('/paths/search/', function (req, res) {
	const params = req.query
	const useID = params.useID

	paths_backend.search(useID)
		.then(val => {
			res.setHeader('Content-Type', 'application/json')
			res.send(val)
		})
		.catch(err => {
			console.error(err)
			res.status(400)
			res.send(err)
		})
		.finally(() => {
			res.end
		})
})