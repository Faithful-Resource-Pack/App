const addons = require('../helpers/firestorm/addons.js')
const contributors = require('../helpers/firestorm/users.js')
const { validator, single } = require('../validator.js')

const ADDON_STATUS_PENDING = 'pending'

const __validURL = (str) => {
  const pattern = new RegExp('^(https?:\\/\\/)?' +       // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' +                      // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +                  // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' +                         // query string
    '(\\#[-a-z\\d_]*)?$', 'i')                           // fragment locator
  return !!pattern.test(str)
}

const titleSchematic = {
  name: "title",
  type: "string",
  length: {
    min: 4,
    max: 24
  }
}
const titleSchematicSubmit = {
  ...titleSchematic,
  ...{
    validator: async (value) => {
      let result = await addons.get(value.split(' ').join('_')).catch(() => { })
      if (result) throw new Error('This title is already in use!')
    }
  }
}

const addonSchematic = [
  {
    name: "authors",
    type: "array",
    length: {
      min: 1
    },
    validator: (value) => {
      for (let i = 0; i < value.length; i++) {
        const authID = value[i]
        single(authID, {
          type: "string",
          length: { min: 1 },
          validator: async (id) => {
            await contributors.get(id).catch(err => {
              throw err
            })
          }
        })
      }
    }
  },
  {
    name: "type",
    type: "array",
    length: {
      min: 2
    },
    validator: (value) => {
      const editions = ["Bedrock", "Java"]
      const resolutions = ["32x", "64x"]
      const valids = [...editions, ...resolutions]

      for (let i = 0; i < value.length; i++) {
        if (!valids.includes(value[i])) throw new Error(`${value[i]} is not a valid type, valids type: [${valids.join(', ')}]`)
      }

      hasOneEdition = false
      editions.forEach(edition => { if (value.includes(edition)) hasOneEdition = true })
      if (!hasOneEdition) throw new Error(`You need at least 1 editions in types, editions: [${editions.join(', ')}]`)

      hasOneRes = false
      resolutions.forEach(res => { if (value.includes(res)) hasOneRes = true })
      if (!hasOneRes) throw new Error(`You need at least 1 resolution in types, resolutions: [${resolutions.join(', ')}]`)

    }
  },
  {
    name: "downloads",
    type: "object",
    validator: (values) => {
      if (!Object.keys(values).length) throw new Error('Download object can not be empty')

      for (const name in values) {
        values[name].forEach(link => {
          single(link, { type: "string" })
          if (!__validURL(link)) throw new Error(`The URL ${link} is not a valid URL`)
        })
      }
    }
  },
  {
    name: "images",
    type: "object",
    validator: async (value) => {
      await validator(value, [{
        name: "carousel",
        type: "array",
        validator: async (imgs) => {
          for (let i = 0; i < imgs.length; i++) await single(imgs[i], { type: "string", length: { min: 1 } })
        }
      },
      {
        name: "header",
        type: "string",
        length: { min: 1 }
      }])
    } 
  },
  {
    name: "description",
    type: "string",
    length: {
      min: 1,
      max: 4096
    }
  },
  {
    name: "comments",
    type: "boolean"
  },
  {
    name: "optifine",
    type: "boolean"
  }
]

module.exports = {
  search: function (el, type) {
    if (!type || !el) Promise.reject(new Error('Search function parameters undefined'))

    /** @type {import('../helpers/firestorm').SearchOption[]} */
    const searchOptions = []

    if (type === 'author') {
      searchOptions.push({
        field: 'authors',
        criteria: 'array-contains',
        value: el
      })
    }

    if (type === 'status') {
      searchOptions.push({
        field: 'status',
        criteria: '==',
        value: el
      })
    }

    return addons.search(searchOptions)
  },
  get: function (fields = []) {
    if (fields.length === 0) return addons.read_raw()

    return addons.select({ fields: fields })
  },
  submit: function (body) {
    return single(body, { type: "object" })
    .then(() => {
      return validator(body, [titleSchematicSubmit, ...addonSchematic])
    })
    .then(() => {
      const obj = {}
      obj.id = body.title.split(' ').join('_')
      const fArr = ['title', 'description', 'authors', 'id', 'status', 'comments', 'optifine', 'type', 'downloads', 'images']

      fArr.forEach(fieldKept => {
        if (fieldKept in body) obj[fieldKept] = body[fieldKept]
      })

      obj.status = ADDON_STATUS_PENDING

      return addons.set(obj.id, obj)
    })
  },
  remove: function (addonID, editorDiscordID) {
    return single(addonID, {
      type: "string",
      validator: async (id) => {
        const addon = await addons.get(id).catch(err => { throw err })
        let canEdit = addon.authors.includes(editorDiscordID) ? true : (await contributors.get(editorDiscordID).catch(() => { return { type: [] } })).type.includes('Administrator')

        if (!canEdit) throw new Error('Only authors or admins can delete an addon.')
      }
    })
    .then(() => {
      return addons.remove(addonID)
    })
  },
  edit: function (body, editorDiscordID) {
    return single(body, { type: "object" })
    .then(() => {
      return single(body.id, {
        type: "string",
        validator: async (id) => {
          const addon = await addons.get(id).catch(err => { throw err })
          let canEdit = addon.authors.includes(editorDiscordID) ? true : (await contributors.get(editorDiscordID).catch(() => { return {type: []} })).type.includes('Administrator')
          
          if (!canEdit) throw new Error ('Only authors or admins can edit an addon.')
        }
      })
    })
    .then(() => {
      return validator(body, [titleSchematic, ...addonSchematic])
    })
    .then(() => {
      const obj = {}
      const fArr = ['title', 'description', 'authors', 'id', 'status', 'comments', 'optifine', 'type', 'downloads', 'images']
      
      fArr.forEach(fieldKept => {
        if (fieldKept in body) obj[fieldKept] = body[fieldKept]
      })

      obj.status = ADDON_STATUS_PENDING // set the object to "pending" each time someone modify the addon

      return addons.set(obj.id, obj)
    })
  },
  approval: function (approval, status, id) {
    const obj = {}
    const fArr = ['author', 'reason']

    fArr.forEach(fieldKept => {
      if (fieldKept in approval) obj[fieldKept] = approval[fieldKept]
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
