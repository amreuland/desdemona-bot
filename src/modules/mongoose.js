'use strict'

const { Module } = require('sylphy')

class MongooseModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'mongoose:logger',
      events: {
        'mongoose:registered': 'onSchemaRegistered',
        'mongoose:connected': 'onConnected'
      }
    })
  }

  onSchemaRegistered ({ name, count } = {}) {
    this.logger.debug(`Schema '${name}' registered`)
  }

  onConnected () {
    this.logger.debug('MongoDB connection established')
  }
}

module.exports = MongooseModule
