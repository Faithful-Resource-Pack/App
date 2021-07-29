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
  },
  update: function(oldVersion, newVersion) {
    return paths.read_raw() // this cannot be done without a read/write raw :'(
    .then(allPaths => {
      for (const pathID in allPaths) {
        if (!allPaths[pathID].versions || allPaths[pathID].versions == []) continue

        if (allPaths[pathID].versions.includes(oldVersion)) {
          // remove old value
          allPaths[pathID].versions = allPaths[pathID].versions.filter(el => el != oldVersion)
          // add the new
          allPaths[pathID].versions.push(newVersion)
        }

        // sort versions
        allPaths[pathID].versions = allPaths[pathID].versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        // remove duplicate (if so)
        allPaths[pathID].versions = [...new Set(allPaths[pathID].versions)]
        // reverse it to get the highest version first
        allPaths[pathID].versions.reverse()
      }
      paths.write_raw(allPaths)
    })
  }
}