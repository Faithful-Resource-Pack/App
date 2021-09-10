const textures = require('../helpers/firestorm/texture.js')
const uses = require('../helpers/firestorm/texture_use.js')
const paths = require('../helpers/firestorm/texture_paths.js')
const { single, textureSchema, validator } = require('../validator.js')

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
      .then((versions, useIDs) => {
        validator(data, [{
          name: 'version',
          type: 'string',
          validator: function (value) {
            if (!versions.includes(value)) throw new Error('Invalid version')
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
          values: useIDs
        }])
      })
  }
}
