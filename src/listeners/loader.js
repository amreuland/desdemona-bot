'use strict'

const { Listener } = require('sylphy')

class LoaderListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'loader:logger',
      events: {
        'loader:registered': 'onModuleRegistered',
        'redis:error': 'onError'
      }
    })
  }

  onModuleRegistered ({ name, count } = {}) {
    this.logger.debug(`Module '${name}' loaded`)
  }

  onError (err) {
    this.logger.error(`Loader Error - ${err}`)
    this._client.raven.captureException(err)
  }
}

module.exports = LoaderListener
