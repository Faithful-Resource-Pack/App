/**
 * @typedef {Object} LengthOption
 * @property {Number?} min Minimum value or 0
 * @property {Number?} max Maximum value
 */

/**
 * @typedef {Object} FieldObject
 * @property {String?} name name of the field to check
 * @property {"string" | "integer" | "array"} type Type verifications available
 * @property {String|LengthOption?} length String or array length verification
 * @property {Function?} validator Validation value function
 * @property {Schema} Children array children validation
 */

/**  
 * @typedef {Array<FieldObject>} Schema
 */

function useSchema(editions, versions) {
  return [{
    name: 'name',
    type: 'string',
    length: { min: 1 }
  }, {
    name: 'editions',
    type: 'array',
    length: { min: 1, max: 1 },
    validator: function(array, parent) {
      array.forEach(edi => {
        if(!editions.includes(edi)) throw new Error(`Unknown edition "${edi}" in ${JSON.stringify(array)}. Only accepts ${JSON.stringify(editions)}`)
      })
    }
  }, {
    name: 'paths',
    type: 'array',
    validator: function(array, parent) {
      single(array, {
        type: 'array',
        length: 2
      }, parent)
      array.forEach(pair => {
        single(pair[0], {
          type: 'string',
          length: { min: 1 }
        }, pair)
        
        single(pair[1], {
          type: 'array',
          length: { min: 1 }
        }, pair)

        pair[1].forEach(ver => {
          if(!versions.includes(ver)) throw new Error(`Unknown version "${pair[1]}" in ${JSON.stringify(pair)}. Only accepts ${JSON.stringify(versions)}`)
        })
      })
    }
  }]
}

function textureSchema(types, editions, versions) {
  return {
    type: 'array',
    children: [{
      name: 'name',
      type: 'string',
      length: { min: 1 }
    }, {
      name: 'type',
      type: 'array',
      length: { min: 1 },
      validator: function(array, parent) {
        array.forEach(type => {
          if(!types.includes(type)) throw new Error('Unknown type "' + type +'". Only accepts ' + JSON.stringify(types))
        })
      },
    }, {
      name: 'uses',
      type: 'array',
      children: useSchema(editions, versions)
    }]
  }
}

/**
 * Verify single value
 * @param {*} value Value to verify
 * @param {FieldObject} field Field object to verify
 * @param {*?} parent Parent object, helps for error detection
 */
function single(value, field, parent = undefined) {
  const parentError = parent !== undefined ? ` in ${ JSON.stringify(parent)}` : ''

  field.type = (field.type || '').toLowerCase()
  // type
  switch (field.type) {
    case 'string':
      if(typeof(value) !== 'string') throw new Error(` ${field.name} type is not ${field.type}${parentError}`)
      break
    case 'integer':
      if(typeof(value) !== 'string') throw new Error(` ${field.name} type is not ${field.type}${parentError}`)
      break
    case 'array':
      if(!Array.isArray(value)) throw new Error(` ${field.name} type is not ${field.type}${parentError}`)
      break
    default:
      throw new Error(`Unsupported field type for ${field.name ||'single'}${parentError}`)
  }

  // length
  if('length' in field && ['string', 'array'].includes(field.type)) {
    const extremum = typeof(field.length) === 'string' ? { min: field.length, max: field.length }: Object.assign({}, { min: 0 }, field.length)

    if(value.length < extremum.min) throw new Error(`${field.name || field.type} length lower than ${extremum.min}${parentError}`)
    if('max' in extremum && value.length > extremum.max) throw new Error(`${field.name || field.type} length greater than ${extremum.max}${parentError}`)
  }

  // validator
  if('validator' in field) {
    if(typeof field.validator !== 'function') throw new Error(`${field.name} validator is not a function in schema ${JSON.stringify(field)}`)

    field.validator(value, parent)
  }

  // children
  if(field.type === 'array' && 'children' in field) {
    for(let c_i = 0; c_i < value.length; ++c_i) {
      validator(value[c_i], field.children)
    }
  }
}

/**
 * Verify a complex object
 * @param {Object} obj Object to verify
 * @param {Schema} schema Schema array with fields to verify
 */
function validator(obj, schema) {
  if(!Array.isArray(schema)) throw new Error(`Incorrect schema ${JSON.stringify(schema)} for obj ${JSON.stringify(obj)}`)

  for(let i = 0; i < schema.length; ++i) {
    const field = schema[i]
    // presence
    if(!field.name in obj || obj[field.name] === undefined || obj[field.name] === null) throw new Error(`Missing field ${field.name} in ${JSON.stringify(obj)}`)

    const value = obj[field.name]

    single(value, field, obj)
  }
}

try {
  if(module) {
    module.exports = {
      useSchema,
      textureSchema,
      single,
      validator
    }
  }
} catch (_error) {
  // normal browser
}