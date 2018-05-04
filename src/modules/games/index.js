'use strict'

const { NaviModule } = require.main.require('./lib')

class GameModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'game',
      description: 'Game commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = GameModule
