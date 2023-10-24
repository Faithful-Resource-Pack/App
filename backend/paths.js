const paths = require('../helpers/firestorm/texture_paths.js')

module.exports = {
  path: function () {
    return paths.read_raw()
  },
  change: function (body) {
    const elID = body.id
    const obj = {}
    const fArr = ['useID', 'path', 'versions', 'mcmeta']

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
}