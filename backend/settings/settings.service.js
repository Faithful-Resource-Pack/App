const { settings } = require('../../helpers/firestorm/all')

module.exports = {
  read: function() {
    return settings.read_raw()
  },
  update: function(_params, data) {
    return settings.write_raw(data)
  }
}