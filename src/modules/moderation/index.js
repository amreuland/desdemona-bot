'use strict'

const { NaviModule } = require.main.require('./lib')

class ModerationModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'moderation',
      description: 'Moderation commands and components',
      commands: true
    })
  }

  getModulePath () { return __dirname }
}

module.exports = ModerationModule
