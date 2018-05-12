'use strict'

const { NaviModule } = require.main.require('./lib')

class CurrencyModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'currency',
      description: 'Currency commands and components',
      services: true
    })
  }

  getModulePath () { return __dirname }
}

module.exports = CurrencyModule
