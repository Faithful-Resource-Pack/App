const service = require('./settings.service.js')
const settings = require('../../resources/settings.json')

const METHOD = 0
const URL = 1
const FUNCTION = 2

const CONTROLLER_MAP = [
  ['post', '/settings/raw', service.update],
  ['get', '/settings/raw', service.read],
]

module.exports = {
  /**
   * @param {Function<Promise>} before Function started before
   * @param {import('express').Express} app Application
   * @param {Function<Promise>} successHandler Function started after
   * @param {Function<Promise>} errorHandler Function started after
   */
  configure: function(before, app, successHandler, errorHandler) {
    CONTROLLER_MAP.forEach(e => {
      app[e[METHOD]]([e[URL]], function(req, res) {
        //* Uses discord token in header
        before(req.headers.discord, [settings.roles.admin.name, settings.roles.dev.name])
          .then(() => {
            return e[FUNCTION](req.params, req.body)
          })
          .then(successHandler(res))
          .catch(errorHandler(res))
      })
    })
  }
}
