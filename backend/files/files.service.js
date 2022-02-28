const firestorm = require('../../helpers/firestorm')
const { files } = require('../../helpers/firestorm/all')
const validator = require('../../validator')

const DOMAIN_EXT = '.com'

module.exports = {
  create: function(_params, data) {
    return files.add(data)
  },
  read: function(params) {
    return files.read_raw()
  },
  update: function(params, data) {
    const id = params.id
    return files.set(id, data)
  },
  delete: function(params) {
    const ids = params.id.split(',')

    // remove from disk then remove from db
    return files.searchKeys(ids)
      .then(objs => {
        const cmp_files = objs.map(e => e.source).filter(e => e.includes('//database')).map(e => firestorm.files.delete(e.substring(e.indexOf(DOMAIN_EXT) + DOMAIN_EXT.length)))

        return Promise.allSettled(cmp_files)
      })
      .finally(() => {
        return files.removeBulk(ids)
      })
  }
}