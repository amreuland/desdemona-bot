'use strict'

const { NaviModule } = require.main.require('./lib')

class UtilModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'util',
      description: 'Utilitiy commands and components',
      commands: true
    })
  }

  getModulePath () { return __dirname }
}

module.exports = UtilModule
