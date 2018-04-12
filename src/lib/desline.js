'use strict'

const Waterline = require('waterline')
const fs = require('fs')
const path = require('path')

const normalizedPath = path.join(__dirname, '..', 'models')

module.exports = async function desline (config) {
  let waterline = new Waterline()

  fs.readdirSync(normalizedPath).forEach(function (file) {
    waterline.registerModel(
      Waterline.Collection.extend(
        require(path.join(normalizedPath, file))
      )
    )
  })

  return new Promise((resolve, reject) => {
    waterline.initialize(config, (err, ontology) => {
      if (err) {
        return reject(err)
      }

      return resolve({waterline, ontology})
    })
  })
}
