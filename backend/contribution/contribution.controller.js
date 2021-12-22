const service = require('./contribution.service.js')
const settings = require('../../resources/settings.json')

const METHOD = 0
const URL = 1
const FUNCTION = 2

const CONTROLLER_MAP = [
  ['post', '/contribution/', service.add],
  ['put', '/contribution/:id', service.edit],
  ['delete', '/contribution/:id', service.delete]
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
        before(req.body.token, [settings.roles.admin.name, settings.roles.dev.name])
          .then(userID => {
            return e[FUNCTION](req.params, req.body)
          })
          .then(successHandler(res))
          .catch(errorHandler(res))
      })
    })
  }
}
