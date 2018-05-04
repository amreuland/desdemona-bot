'use strict'

const { NaviModule } = require.main.require('./lib')

class HelpModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'help',
      description: 'Help commands and components',
      commands: 'commands.js'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = HelpModule
