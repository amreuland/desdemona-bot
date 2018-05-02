'use strict'

const { Listener } = require('sylphy')

class RedisListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'redis:logger',
      events: {
        'redis:registered': 'onCacheRegistered',
        'redis:connect': 'onConnect',
        'redis:error': 'onError'
      }
    })
  }

  onCacheRegistered ({ name, count } = {}) {
    this.logger.debug(`Cache '${name}' registered`)
  }

  onConnect (name) {
    this.logger.debug(`Redis connection established (${name})`)
  }

  onError (err, name) {
    this.logger.error(`Redis Error (${name}) - ${err}`)
    this._client.raven.captureException(err)
  }
}

module.exports = RedisListener
