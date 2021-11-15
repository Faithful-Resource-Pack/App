const firestorm = require('.')
require('./firestorm_config')()

/**
 * @typedef {Object} Settings
 */

module.exports = firestorm.collection('settings')