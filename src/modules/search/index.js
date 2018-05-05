'use strict'

const { NaviModule } = require.main.require('./lib')

class SearchModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'search',
      description: 'Search commands and components',
      commands: true
    })
  }

  getModulePath () { return __dirname }
}

module.exports = SearchModule
