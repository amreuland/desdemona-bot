'use strict'

const { NaviModule } = require.main.require('./lib')

class MusicModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'music',
      description: 'Music commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = MusicModule
