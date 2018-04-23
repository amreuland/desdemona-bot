'use strict'

const { Interface } = require('../lib')

class SteamAPI extends Interface {
  constructor (...args) {
    super({
      name: 'steam'
    })
  }
}

module.exports = SteamAPI
