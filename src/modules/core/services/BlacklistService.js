'use strict'

const { NaviService } = require.main.require('./lib')

class BlacklistService extends NaviService {
  constructor (...args) {
    super(...args, {
      name: 'Blacklist'
    })
  }
}

module.exports = BlacklistService
