'use strict'

const { Module } = require('sylphy')

class CommanderModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'commander:logger',
      events: {
        'commander:registered': 'onCommandRegistered'
      }
    })
  }

  onCommandRegistered ({ trigger, group, aliases } = {}) {
    this.logger.debug(`Command '${trigger}' in group '${group}' registered with ${aliases} aliases`)
  }
}

module.exports = CommanderModule
