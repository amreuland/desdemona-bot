'use strict'

const { Interface } = require('../lib')

class PastebinAPI extends Interface {
  constructor (...args) {
    super({
      name: 'pastebin'
    })
  }
}

module.exports = PastebinAPI
