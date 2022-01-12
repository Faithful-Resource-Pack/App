const firestorm_users = require('../helpers/firestorm/users')

module.exports = {
  userTypes: function() {
    return firestorm_users.select({ fields: [ "type" ] })
      .then((users) => {
        // create array type
        let types = []
        Object.values(users).forEach(user => {
          types = [ ...types, ...(user.type || []) ]
        })

        // delete duplicates
        types = types.filter((t, index) => {
          return types.indexOf(t) == index && (types.indexOf(t.toLowerCase()) == -1 || types.indexOf(t.toLowerCase()) == index)
        })

        return types
      })
  },
  searchUserByUsername: function(searchterm) {
    if(!searchterm || searchterm.length < 3) return Promise.reject(new Error('User search requires at least 3 letters'))

    return this.search([{
      criteria: "includes",
      field: "username",
      value: searchterm
    }])
  },
  /**
   * @param {import('../helpers/firestorm/index').SearchOption[]} searchOptions search options
   */
  search: function(searchOptions) {
    return firestorm_users.search(searchOptions)
  },
  /**
   * @param {String} id Discord User ID
   * @returns {Promise<import('../helpers/firestorm/users').User>}
   */
  getUser: function(id) {
    return firestorm_users.get(id)
  },
  change: function(body) {
    const element_id = body.id

    const obj = {}
    const f_arr = ['username', 'type', 'uuid', 'media', 'warns', 'muted', 'id']
    f_arr.forEach(fieldKept => {
      if(fieldKept in body)
        obj[fieldKept] = body[fieldKept]
    })

    /** @type {import('../helpers/firestorm').EditObject[]} */
    const edits = Object.keys(obj).map(field => {
      return {
        id: element_id,
        field: field,
        operation: 'set',
        value: obj[field]
      }
    })

    return firestorm_users.editFieldBulk(edits)
  },
  add: function(body) {
    const userID = body.id
    const obj = {}
    const fArr = ['username', 'type', 'uuid', 'media', 'warns', 'muted', 'id']
    fArr.forEach(fieldKept => {
      if(fieldKept in body)
        obj[fieldKept] = body[fieldKept]
    })

    return firestorm_users.set(userID, obj)
  },
  remove: function(user_id) {
    return firestorm_users.remove(user_id)
  },
  get: function() {
    return firestorm_users.read_raw()
  }
}