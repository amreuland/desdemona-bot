'use strict'

const { Listener } = require('../sylphy')

class CommanderListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'commander:logger',
      events: {
        'commander:registered': 'onCommandRegistered',
        'commander:commandError': 'onCommandError'
      }
    })
  }

  onCommandRegistered ({ trigger, group, aliases } = {}) {
    this.logger.debug(`Command '${trigger}' in group '${group}' registered with ${aliases} aliases`)
  }

  onCommandError (err) {
    this._client.raven.captureException(err)
  }
}

module.exports = CommanderListener
