'use strict'

const { Interface } = require('../lib')

class OverwatchAPI extends Interface {
  constructor (...args) {
    super({
      name: 'overwatch'
    })
  }
}

module.exports = OverwatchAPI
