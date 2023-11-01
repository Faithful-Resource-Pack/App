const textures = require('../helpers/firestorm/texture.js')
const uses = require('../helpers/firestorm/texture_use.js')
const paths = require('../helpers/firestorm/texture_paths.js')
const { single, textureSchema, validator } = require('../validator.js')
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
  searchKeys(ids) {
    return textures.searchKeys(ids)
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
        const pathEditBulk = pathIDs.map(pathID => {
          return {
            id: pathID,
            field: 'versions',
            operation: 'array-push',
            value: data.newVersion
          }
        })

        return paths.editFieldBulk(pathEditBulk)
      })
  },
}
