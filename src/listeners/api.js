'use strict'

const { Listener } = require('../sylphy')

class APILoggerListener extends Listener {
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

module.exports = APILoggerListener
