'use strict'

const { Listener } = require('sylphy')

class TaskerListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'tasker:logger',
      events: {
        'tasker:registered': 'onTaskRegistered',
        'tasker:error': 'onError'
      }
    })
  }

  onTaskRegistered ({ name, interval, count } = {}) {
    this.logger.debug(`Task '${name}' added with interval of ${interval}ms`)
  }

  onError (err) {
    this.logger.error(`Tasker Error - ${err}`)
    this._client.raven.captureException(err)
  }
}

module.exports = TaskerListener
