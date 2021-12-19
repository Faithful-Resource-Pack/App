const firestorm = require('.')

require('./firestorm_config')()

module.exports = firestorm.collection('files')