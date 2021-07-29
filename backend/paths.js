const paths = require('../helpers/firestorm/texture_paths.js')

module.exports = {
  path: function() {
    return paths.read_raw().catch(err => console.trace(err))
  },
  search: function (useID) {
    if (!useID) return Promise.reject(new Error('Search function paramater undefined'))

    /** @type {import('../helpers/firestorm').SearchOption[]} */
    const searchOptions = []

    // made it like that to easily implement other search options
    if (useID != undefined) {
      searchOptions.push({
        field: 'useID',
        criteria: '==',
        value: useID
      })
    }

    return paths.search(searchOptions)
  },
  change: function (body) {
    const elID = body.id
    const obj = {}
    const fArr = [ 'useID', 'path', 'versions' ]

    fArr.forEach(field_kept => {
      if (field_kept in body) obj[field_kept] = body[field_kept]
    })

    /** @type {import('../helpers/firestorm').EditObject[]} */
    const edits = Object.keys(obj).map(field => {
      return {
        id: elID,
        field: field,
        operation: 'set',
        value: obj[field]
      }
    })

    return paths.editFieldBulk(edits)
  },
  add: function (body) {
    const obj = {}
    const fArr = [ 'useID', 'path', 'versions' ]

    fArr.forEach(field_kept => {
      if (field_kept in body) obj[field_kept] = body[field_kept]
    })

    return paths.add(obj)
  },
  remove: function(path_id) {
    return paths.remove(path_id)
  }
}