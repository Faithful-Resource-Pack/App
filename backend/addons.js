const addons = require('../helpers/firestorm/addons.js')

module.exports = {
  search: function(el, type) {
    if (!type || !el) Promise.reject(new Error('Search function parameters undefined'))

    /** @type {import('../helpers/firestorm').SearchOption[]} */
    const searchOptions = []

    if (type == 'author') {
      searchOptions.push({
        field: 'authors',
        criteria: 'array-contains',
        value: el
      })
    } 

    return addons.search(searchOptions)
  },
  get: function() {
    return addons.read_raw()
  },
  submit: function(body) {
    let obj = {}
    obj.status = 'pending'
    obj.id = body.title.split(' ').join('_')
    const fArr = [ 'title', 'description', 'authors', 'id', 'status', 'comments', 'optifine', 'type', 'downloads', 'images' ]

    fArr.forEach(field_kept => {
      if (field_kept in body) obj[field_kept] = body[field_kept]
    })

    return addons.set(obj.id, obj)
  },
  remove: function(addon_id) {
    return addons.remove(addon_id)
  }
}