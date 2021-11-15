const uses = require('../helpers/firestorm/texture_use.js')
const paths = require('../helpers/firestorm/texture_paths.js')

module.exports = {
  uses() {
    return uses.read_raw().catch(err => console.trace(err))
  },
  texturesIDsFromEdition(edition, ids) {
    return uses.searchKeys(ids)
      .then(uses => {
        const ids = []
        for (const useID in uses)
          if (uses[useID].editions.includes(edition)) ids.push(uses[useID].textureID)

        return ids
      })
  },
  searchTextureID(searchOptions) {
    return uses.search(searchOptions)
  },
  search(textureID) {
    if (!textureID) return Promise.reject(new Error('Search function parameter undefined'))

    /** @type {import('../helpers/firestorm').SearchOption[]} */
    const searchOptions = []

    // made it like that to easily implement other search options
    if (textureID != undefined) {
      searchOptions.push({
        field: 'textureID',
        criteria: '==',
        value: textureID
      })
    }

    return uses.search(searchOptions)
  },
  change(body) {
    const elID = body.id
    const obj = {}
    const fArr = ['textureUseName', 'id', 'textureID', 'editions']

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

    return uses.editFieldBulk(edits)
  },
  add(body) {
    const elID = body.id
    const obj = {}
    const fArr = ['textureID', 'textureUseName', 'editions']

    fArr.forEach(field_kept => {
      if (field_kept in body) obj[field_kept] = body[field_kept]
    })

    return uses.set(elID, obj)
  },
  remove(useID, deleteSubPaths = true) {

    if (deleteSubPaths) {
      paths.search([{
        field: 'useID',
        criteria: '==',
        value: useID
      }])
        .then(pathsObj => {
          let keyToDelete = []
          for (const path in pathsObj) {
            keyToDelete.push(pathsObj[path].id)
          }
          paths.removeBulk(keyToDelete)
        })
    }

    return uses.remove(useID)
  }
}