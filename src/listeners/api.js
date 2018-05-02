'use strict'

const { Module } = require('sylphy')

class APILoggerModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'api:logger',
      events: {
        'api:registered': 'onAPIRegistered'
      }
    })
  }

  onAPIRegistered ({ name, count } = {}) {
    this.logger.debug(`API '${name}' registered`)
  }
}

module.exports = APILoggerModule
