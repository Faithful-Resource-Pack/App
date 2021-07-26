const uses = require('../helpers/firestorm/texture_use.js')

module.exports = {
  uses: function() {
    return uses.read_raw().catch(err => console.trace(err))
  },
  search: function (textureID) {
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
  }
}