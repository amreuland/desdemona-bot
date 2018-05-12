'use strict'

const { Listener } = require('../sylphy')

class ServicesLogger extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'services:logger',
      events: {
        'services:registered': 'onServiceRegistered',
        'services:error': 'onError'
      }
    })
  }

  onServiceRegistered ({ name, count } = {}) {
    this.logger.debug(`Service '${name}' registered`)
  }

  onError (err) {
    this.logger.error(`Service Error - ${err}`)
    this._client.raven.captureException(err)
  }
}

module.exports = ServicesLogger
