const service = require('./files.service.js')
const settings = require('../../resources/settings.json')

const METHOD = 0
const PATH = 1
const FUNCTION = 2

const RESOURCE_ROOT = '/files'

const RESOURCE_MAP = [
  ['post', '/', service.create],
  ['get', '/', service.read],
  ['put', '/:id', service.update],
  ['delete', '/:id', service.delete]
]

module.exports = {
  /**
   * @param {Function<Promise>} before Function started before
   * @param {import('express').Express} app Application
   * @param {Function<Promise>} successHandler Function started after
   * @param {Function<Promise>} errorHandler Function started after
   * @param {Function<Promise>} getSuccessHandler Function started after
   */
  configure: function(before, app, successHandler, errorHandler, getSuccessHandler) {
    RESOURCE_MAP.forEach(endpoint => {
      app[endpoint[METHOD]]([RESOURCE_ROOT + endpoint[PATH]], function(req, res) {
        const beforeProm = endpoint[METHOD] === 'get' ? Promise.resolve(-1) : before(req.body.token || req.query.token, [...settings.roles.admin.name, ...settings.roles.dev.name])
          
        beforeProm.then(userID => {
            return endpoint[FUNCTION](req.params, req.body)
          })
          .then((val) => {
            if(endpoint[METHOD] === 'get')
              getSuccessHandler(res)(val)
            else
              successHandler(res)
          })
          .catch(errorHandler(res))
      })
    })
  }
}