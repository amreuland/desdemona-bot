'use strict'

const { Module } = require('sylphy')

class APIModule extends Module {
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

module.exports = APIModule
