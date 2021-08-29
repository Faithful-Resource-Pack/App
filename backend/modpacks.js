const https = require('https')
const fs = require('fs')
const tmp = require('tmp')
const extract = require('extract-zip')

function download (url, dest, callback) {
  const file = fs.createWriteStream(dest)
  https.get(url, (res) => {
    res.pipe(file)
    file.on('finish', () => {
      file.close(callback)
    })
  }).on('error', (err) => {
    fs.unlink(dest)
    if (callback) callback(err.message)
  })
}

module.exports = {
  /**
   * Get the manifest file from a modpack .zip archive (downloaded from curserforge)
   * @param {String} id download file id
   * @param {String} filename download file name
   * @returns {Object} manifest
   */
  manifest: function(id, filename) {
    return new Promise((resolve, reject) => {
      const tmpObj = tmp.dirSync()

      download(
        // https://media.forgecdn.net/files/2935/316/RLCraft%201.12.2%20-%20Beta%20v2.8.2.zip
        `https://media.forgecdn.net/files/${id.substring(0, 4)}/${id.substring(4)}/${filename}`, 
        `${tmpObj.name}/${filename}`, 
        (error) => {

          // TODO: implement delete of the tmp dir afterward

          if (error) {
            return reject(error)
          }
    
          extract(`${tmpObj.name}/${filename}`, { dir: tmpObj.name })
          .then(() => {
            const manifest = JSON.parse(fs.readFileSync(`${tmpObj.name}/manifest.json`))
            return resolve(manifest)
          })
          .catch(err => {
            return reject(err)
          })
    
        })
    })
  }
}