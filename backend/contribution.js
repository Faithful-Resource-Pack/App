const allCollection = require('../helpers/firestorm/all')
const { join } = require('path')

const ROOT_JSON = join(__dirname, '..', '..', 'json')
const ROOT_CONTRIB = join(ROOT_JSON, 'contributors')

module.exports = {
  /**
   * 
   * @param {String} edition Game edition to search
   * @param {?String} search search looked
   * @returns {Promise} Result promise
   */
  get: function(edition, search = undefined) {
    return new Promise((resolve, reject) => {

      allCollection.texture_use.search([{
        field: "editions",
        criteria: "array-contains",
        value: edition
      }]).then(uses => {

        let ids = uses.map(use => use.textureID)
        ids.filter((val, index) => index === ids.indexOf(val))
        ids = ids.sort()

        console.log(ids)

      }).catch(err => reject(err))
    })
  }
}