'use strict'

const mongoose = require('mongoose')

const fs = require('fs')
const path = require('path')

const normalizedPath = path.join(__dirname, '..', 'models')

module.exports = async function desline (config) {

  fs.readdirSync(normalizedPath).forEach(function (file) {
    let {schema, name} = require(path.join(normalizedPath, file))
    mongoose.model(name, new mongoose.Schema(schema))
  })

  return new Promise((resolve, reject) => {
    mongoose.connection.once('open', () => {
      resolve(mongoose)
    })
    mongoose.connect(config.uri)
  })
}
