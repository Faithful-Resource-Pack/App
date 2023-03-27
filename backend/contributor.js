const firestorm_users = require('../helpers/firestorm/users')
const API_URL = process.env.API_URL || 'https://api.faithfulpack.net/v2/'

module.exports = {
  /**
   * @param {String} id Discord User ID
   * @returns {Promise<import('../helpers/firestorm/users').User>}
   */
  getUser: function(id) {
    return axios.get(`${API_URL}/v2/users/${id}`).then(r => r.data)
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