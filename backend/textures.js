const textures = require('../helpers/firestorm/texture.js')
const uses = require('../helpers/firestorm/texture_use.js')
const paths = require('../helpers/firestorm/texture_paths.js')
const { single, textureSchema, validator } = require('../validator.js')
const PromiseEvery = require('../helpers/promiseEvery.js')
const { ID_FIELD } = require('../helpers/firestorm')

module.exports = {
  textures: function () {
    return textures.read_raw().catch(err => console.trace(err))
  },
  textureTypes: function () {
    return textures.read_raw()
      .then((textures) => {
        // create array type
        let types = []

        for (const textureID in textures) {
          if (Array.isArray(textures[textureID].type)) types = [...types, ...textures[textureID].type]
        }

        // delete duplicates
        types = types.filter((t, index) => {
          return types.indexOf(t) === index && (types.indexOf(t.toLowerCase()) === -1 || types.indexOf(t.toLowerCase()) === index)
        })

        return types
      })
  },
  searchKeys (ids) {
    return textures.searchKeys(ids)
  },
  searchIDs (ids, name) {
    return this.searchKeys(ids)
    .then(all => {
      const ids = []
      for (const id in all)
        if (all[id].name.includes(name)) ids.push(id)
      return ids
    })
  },
  tagIDs (tag, ids) {
    return textures.searchKeys(ids)
    .then(all => {
      const ids = []

      for (const id in all) {
        for (let i = 0; i < all[id].type.length; i++) all[id].type[i] = all[id].type[i].toLowerCase()
        if (all[id].type.includes(tag) || tag === 'all') ids.push(id)
      }

      return ids
    })
  },
  search: function (textureName, textureType) {
    if (!textureName && !textureType) return Promise.reject(new Error('Search function parameters undefined'))

    /** @type {import('../helpers/firestorm').SearchOption[]} */
    const searchOptions = []

    if (textureName !== undefined) {
      searchOptions.push({
        field: 'name',
        criteria: 'includes',
        value: textureName
      })
    }

    if (textureType !== undefined) {
      searchOptions.push({
        field: 'type',
        criteria: 'array-contains',
        value: textureType
      })
    }

    return textures.search(searchOptions)
  },
  change: function (body) {
    const elID = body.id
    const obj = {}
    const fArr = ['name', 'type', 'id']

    fArr.forEach(fieldKept => {
      if (fieldKept in body) obj[fieldKept] = body[fieldKept]
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
  textureEditions: function () {
    return uses.select({
      fields: ['editions']
    }).then(res => {
      return Object.values(res).reduce((acc, cur) => {
        (cur.editions || []).forEach(edi => {
          if (!acc.includes(edi)) acc.push(edi)
        })
        return acc.sort()
      }, [])
    })
  },
  textureVersions: function () {
    return paths.select({
      fields: ['versions']
    }).then(res => {
      return Object.values(res).reduce((acc, cur) => {
        (cur.versions || []).forEach(edi => {
          if (!acc.includes(edi)) acc.push(edi)
        })
        return acc.sort().reverse()
      }, [])
    })
  },
  addTextures: function (value) {
    let textureIDs = []
    const useIDs = []
    const useValues = []

    return Promise.all([this.textureTypes(), this.textureEditions(), this.textureVersions()])
      .then(results => {
        const [types, editions, versions] = results
        const schema = textureSchema(types, editions, versions)

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
      .then((texID) => {
        textureIDs = texID
        value.forEach((texture, ti) => {
          texture.uses.forEach((use, ui) => {
            useIDs.push(textureIDs[ti] + String.fromCharCode('a'.charCodeAt(0) + ui))

            useValues.push({
              textureID: parseInt(textureIDs[ti]),
              textureUseName: use.name,
              editions: use.editions
            })
          })
        })
        return uses.setBulk(useIDs, useValues)
      })
      .then(() => {
        let useIndex = 0
        const pathsToAdd = []
        value.forEach((texture) => {
          texture.uses.forEach((use) => {
            use.paths.forEach((path, _pi) => {
              pathsToAdd.push({
                useID: useIDs[useIndex],
                path: path[0],
                versions: path[1]
              })
            })
            useIndex++
          })
        })

        return paths.addBulk(pathsToAdd)
      })
  },
  addNewMinecraftVersion: function (data) {
    return this.textureEditions()
      .then(editions => {
        validator(data, [{
          name: 'edition',
          type: 'string',
          validator: function (value) {
            if (!editions.includes(value)) throw new Error('Invalid edition')
          }
        }])

        return Promise.all([this.textureVersions(), uses.search([{
          field: 'editions',
          criteria: 'array-contains',
          value: data.edition
        }])])
      })
      .then(results => {
        const [versions, editionUses] = results
        const useIDs = editionUses.map(el => el[ID_FIELD])
        validator(data, [{
          name: 'version',
          type: 'string',
          validator: function (value) {
            if (!versions.includes(value)) throw new Error('Invalid version, expected :' + JSON.stringify(versions) + ', got ' + JSON.stringify(value))
          }
        }, {
          name: 'newVersion',
          type: 'string',
          validator: function (value) {
            if (value.match(/^[0-9]+\.[0-9]+(\.[0-9]+)?$/gm) === null) throw new Error('Invalid new version syntax')
          }
        }])

        return paths.search([{
          field: 'versions',
          criteria: 'array-contains',
          value: data.version
        }, {
          field: 'useID',
          criteria: 'in',
          value: useIDs
        }])
      })
      .then(pathsFound => {
        const pathIDs = pathsFound.map(path => path[ID_FIELD])
        const pathEditBulk = pathIDs.map(pathID => { return {
          id: pathID,
          field: 'versions',
          operation: 'array-push',
          value: data.newVersion
        }})

        return paths.editFieldBulk(pathEditBulk)
      })
  },
  /**
   * Delete textures and uses and paths
   * @param {String|String[]} ids textures ids to delete
   */
  removeTextures(ids) {
    if(!ids) Promise.reject(new Error('Invalid ids for removeTextures backend, expected String or String[]'))
    if(typeof ids === 'string') ids = [ids]

    // type validation for String array
    single(ids, {
      type: 'array'
    })
    ids.forEach(id => {
      single(id, {
        type: 'string'
      }, ids)
    })

    // in order to delete everything, we need to get all the paths, all the uses, and the texture
    let _textures
    let _uses
    return textures.searchKeys(ids)
      .then(result => {
        _textures = result
        return PromiseEvery(_textures.map(t => t.uses()))
      })
      .then(pe => {
        _uses = pe.results.filter(r => r !== undefined).reduce((acc, cur) => acc = [...acc, ...cur], [])
        return PromiseEvery(_uses.map(u => u.paths()))
      })
      .then(pe => {
        _paths = pe.results.filter(r => r !== undefined).reduce((acc, cur) => acc = [...acc, ...cur], [])

        const promises = []
        promises.push(textures.removeBulk(_textures.map(t => t[ID_FIELD])))
        promises.push(uses.removeBulk(_uses.map(u => u[ID_FIELD])))
        promises.push(paths.removeBulk(_paths.map(p => p[ID_FIELD])))
        return Promise.all(promises)
      })
  }
}
