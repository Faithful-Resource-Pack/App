const { texture, contributions, users } = require('../../helpers/firestorm/all')
const validator = require('../../validator')

const schema = [
  {
    name: "date",
    type: "integer",
    validator: function(val) {
      return (new Date(val)) < (new Date())
    }
  },
  {
    name: "textureID",
    type: "string",
    validator: function(val) {
      return texture.get(val)
    }
  },
  {
    name: "contributors",
    type: "array",
    length: { min: 1 },
    validator: function(val) {
      // verify all strings
      val.forEach(userID => {
        validator.single(userID, {
          type: "string"
        })
      })
      // it is a string array
      return users.searchKeys(val)
      .then(res => {
        if(res.length !== val.length) return Promise.reject(new Error('Some users were not found'))
      })
    }
  },
  {
    name: "res",
    type: "string",
    validator: function(val) {
      return ['c32', 'c64'].includes(val) ? Promise.resolve() : Promise.reject(new Error('Incorrect res, got ' + val))
    }
  }
]

const interesting = ['date', 'res', 'textureID', 'contributors']

function filter(data) {
  let res = {}
  interesting.forEach(int => {
    if(int in data) res[int] = data[int]
  })

  return res
}

module.exports = {
  add: function(_params, data) {
    if(data && data.token) delete data.token
    if(data && data.textureID) data.textureID = String(data.textureID)
    return validator.validator(data, schema)
      .then(() => {
        return contributions.add(filter(data))
      })
  },
  edit: function(params, data) {
    if(data && data.token) delete data.token
    if(data && data.textureID) data.textureID = String(data.textureID)
    return validator.validator(data, schema)
      .then(() => {
        return contributions.set(params.id, filter(data))
      })
  },
  delete: function(params) {
    return contributions.remove(params.id)
  }
}