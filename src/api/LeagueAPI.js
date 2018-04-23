'use strict'

const { Interface } = require('../lib')

class LeagueAPI extends Interface {
  constructor (...args) {
    super({
      name: 'lol'
    })
  }
}

module.exports = LeagueAPI
