'use strict'

const { Listener } = require('../sylphy')

class RouterListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'router:logger',
      events: {
        'router:registered': 'onListenerRegistered',
        'router:error': 'onError'
      }
    })
  }

  onListenerRegistered ({ name, count } = {}) {
    this.logger.debug(`Listener '${name}' registered`)
  }

  onError (err, name) {
    this.logger.error(`Router - ${err}`)
    this._client.raven.captureException(err)
  }
}

module.exports = RouterListener
