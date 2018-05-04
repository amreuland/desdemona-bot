'use strict'

const { NaviModule } = require.main.require('./lib')

class FunModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'fun',
      description: 'Fun commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = FunModule
