'use strict'

const { Listener } = require('../sylphy')

class MongooseListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'mongoose:logger',
      events: {
        'mongoose:registered': 'onSchemaRegistered',
        'mongoose:connected': 'onConnected',
        'mongoose:error': 'onError'
      }
    })
  }

  onSchemaRegistered ({ name, count } = {}) {
    this.logger.debug(`Schema '${name}' registered`)
  }

  onConnected () {
    this.logger.debug('MongoDB connection established')
  }

  onError (err) {
    this.logger.error(`Mongo Error - ${err}`)
    this._client.raven.captureException(err)
  }
}

module.exports = MongooseListener
