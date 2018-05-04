'use strict'

const { NaviModule } = require.main.require('./lib')

class PokemonModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'pokemon',
      description: 'Pokemon commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = PokemonModule
