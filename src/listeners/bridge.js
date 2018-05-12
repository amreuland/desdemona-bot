'use strict'

const { Listener } = require('../sylphy')

class BridgeListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'bridge:logger',
      events: {
        'bridge:registered': 'onMiddlewareRegistered',
        'bridge:error': 'onError'
      }
    })
  }

  onMiddlewareRegistered ({ name, count } = {}) {
    this.logger.debug(`Middleware '${name}' registered`)
  }

  onError (err, name) {
    this.logger.error(`Bridge - ${err}`)
    this._client.raven.captureException(err)
  }
}

module.exports = BridgeListener
