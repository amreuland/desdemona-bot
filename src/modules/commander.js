'use strict'

const { Module } = require('sylphy')

class CommanderModule extends Module {
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

module.exports = CommanderModule
