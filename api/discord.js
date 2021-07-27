require('dotenv').config()

const express = require('express')
const fetch = require('node-fetch')
const router = express.Router()
const { URLSearchParams } = require('url');

const CLIENT_ID = process.env.OAUTH2_ID
const CLIENT_TOKEN = process.env.OAUTH2_TOKEN
const REDIRECT_URI = `${process.env.REDIRECT_DOMAIN}/api/discord/callback`

router.get('/login', (req, res) => {
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A5153&response_type=code&scope=identify&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`)
})

router.get('/callback', (req, res) => {
  if (!req.query.code) {
    res.redirect('/compliapp/')
    return
  }

  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID)
  params.append('client_secret', CLIENT_TOKEN)
  params.append('grant_type', 'authorization_code')
  params.append('code', req.query.code)
  params.append('redirect_uri', REDIRECT_URI)
  params.append('scope', 'identify')
  
  fetch('https://discordapp.com/api/oauth2/token', {
    method: 'POST',
    body: params
  })
  .then(response => response.json())
  .then(json => {
    res.redirect(`/compliapp?access_token=${encodeURIComponent(json.access_token)}&refresh_token=${encodeURIComponent(json.refresh_token)}`)
  })
  .catch(err => {
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

module.exports = router;