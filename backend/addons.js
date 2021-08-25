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

    if (type == 'status') {
      searchOptions.push({
        field: 'status',
        criteria: '==',
        value: el
      })
    } 

    return addons.search(searchOptions)
  },
  get: function(fields = []) {
    if (fields.length == 0) return addons.read_raw()

    return addons.select({ "fields": fields })
  },
  submit: function(body) {
    let obj = {}
    obj.id = body.title.split(' ').join('_')
    const fArr = [ 'title', 'description', 'authors', 'id', 'status', 'comments', 'optifine', 'type', 'downloads', 'images' ]

    fArr.forEach(field_kept => {
      if (field_kept in body) obj[field_kept] = body[field_kept]
    })

    obj.status = 'pending'

    return addons.set(obj.id, obj)
  },
  remove: function(addon_id) {
    return addons.remove(addon_id)
  },
  edit: function (body) {
    let obj = {}
    const fArr = ['title', 'description', 'authors', 'id', 'status', 'comments', 'optifine', 'type', 'downloads', 'images']

    fArr.forEach(field_kept => {
      if (field_kept in body) obj[field_kept] = body[field_kept]
    })

    obj.status = 'pending' // set the object to "pending" each time someone modify the addon

    return addons.set(obj.id, obj)
  },
  approval: function (approval, status, id) {
    let obj = {}
    const fArr = [ 'author', 'reason' ]

    fArr.forEach(field_kept => {
      if (field_kept in approval) obj[field_kept] = approval[field_kept]
    })

    return addons.editFieldBulk([{
      id: id,
      operation: 'set',
      field: 'status',
      value: status
    }, 
    {
      id: id,
      operation: 'set',
      field: 'approval',
      value: obj
    }])
  }
}