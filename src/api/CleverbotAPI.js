'use strict'

const { Interface } = require('../lib')

class CleverbotAPI extends Interface {
  constructor (...args) {
    super({
      name: 'cleverbot'
    })
  }
}

module.exports = CleverbotAPI
