const textures = require('../helpers/firestorm/texture.js')
const uses = require('../helpers/firestorm/texture_use.js')
const paths = require('../helpers/firestorm/texture_paths.js')
const { single, textureSchema, validator } = require('../validator.js')

module.exports = {
  textures: function() {
    return textures.read_raw().catch(err => console.trace(err))
  },
  textureTypes: function () {
    return textures.read_raw()
      .then((textures) => {
        // create array type
        let types = []

        for (const textureID in textures) {
          if (Array.isArray(textures[textureID].type)) types = [ ...types, ...textures[textureID].type ]
        }

        // delete duplicates
        types = types.filter((t, index) => {
          return types.indexOf(t) == index && (types.indexOf(t.toLowerCase()) == -1 || types.indexOf(t.toLowerCase()) == index)
        })

        return types
      })
  },
  search: function(texture_name, texture_type) {
    if (!texture_name && !texture_type) return Promise.reject(new Error('Search function parameters undefined'))

    /** @type {import('../helpers/firestorm').SearchOption[]} */
    const searchOptions = []

    if (texture_name != undefined) {
      searchOptions.push({
        field: 'name',
        criteria: 'includes',
        value: texture_name
      })
    }

    if (texture_type != undefined) {
      searchOptions.push({
        field: 'type',
        criteria: 'array-contains',
        value: texture_type
      })
    }

    return textures.search(searchOptions)
  },
  change: function(body) {
    const elID = body.id
    const obj = {}
    const fArr = [ 'name', 'type', 'id' ]
    
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

    return textures.editFieldBulk(edits)

  },
  textureEditions: function() {
    return uses.select({
      fields: ['editions'] 
    }).then(res => {
      return Object.values(res).reduce((acc, cur) => {
        (cur.editions || []).forEach(edi => {
          if(!acc.includes(edi)) acc.push(edi)
        })
        return acc.sort()
      }, [])
    })
  },
  textureVersions: function() {
    return paths.select({
      fields: ['versions'] 
    }).then(res => {
      return Object.values(res).reduce((acc, cur) => {
        (cur.versions || []).forEach(edi => {
          if(!acc.includes(edi)) acc.push(edi)
        })
        return acc.sort().reverse()
      }, [])
    })
  },
  addTextures: function(value) {
    let texture_ids = []
    const use_ids = []
    const use_values = []

    return Promise.all([this.textureTypes(), this.textureEditions(), this.textureVersions()])
    .then((types, editions, versions) => {
      const schema = textureSchema(types, editions, versions, versions)

      single(value, schema)
    })
    .then(() => {
      return textures.addBulk(value.map(e => {
        return {
          name: e.name,
          type: e.type
        }
      }))
    })
    .then((tex_ids) => {
      texture_ids = tex_ids
      value.forEach((texture, t_i) => {
        texture.uses.forEach((use, u_i) => {
          use_ids.push(texture_ids[t_i] + String.fromCharCode('a'.charCodeAt(0) + u_i))

          use_values.push({
            textureID: parseInt(texture_ids[t_i]),
            textureUseName: use.name,
            editions: use.editions
          })
        })
      })
      return uses.setBulk(use_ids, use_values)
    })
    .then(() => {
      let use_index = 0
      let pathsToAdd = []
      value.forEach((texture) => {
        texture.uses.forEach((use) => {
          use.paths.forEach((path, p_i) => {
            pathsToAdd.push({
              useID: use_ids[use_index],
              path: path[0],
              versions: path[1]
            })
          })
          use_index++
        })
      })

      return paths.addBulk(pathsToAdd)
    })
  },
  addNewMinecraftVersion: function(data) {
    return this.textureEditions()
    .then(editions => {
      validator(data, [{
        name: 'edition',
        type: 'string',
        validator: function(value) {
          if(!editions.includes(value)) throw new Error('Invalid edition')
        }
      }])

      return Promise.all([this.textureVersions(), uses.search([{
        field: 'editions',
        criteria: 'array-contains',
        value: data.edition
      }])])
    })
    .then((versions, useIDs) => {
      validator(data, [{
        name: 'version',
        type: 'string',
        validator: function(value) {
          if(!versions.includes(value)) throw new Error('Invalid version')
        }
      }, {
        name: 'newVersion',
        type: 'string',
        validator: function(value) {
          if(value.match(/^[0-9]+\.[0-9]+(\.[0-9]+)?$/gm) === null) throw new Error('Invalid new version syntax')
        }
      }])

      return paths.search([{
        field: 'versions',
        criteria: 'array-contains',
        value: data.version
      }, {
        field: 'useID',
        criteria: 'in',
        values: useIDs
      }])
    })
  }
}