'use strict'

const { NaviModule } = require.main.require('./lib')

class ModerationModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'moderation',
      description: 'Moderation commands and components',
      services: true,
      commands: true,
      middleware: true
    })
  }

  getModulePath () { return __dirname }
}

module.exports = ModerationModule
