'use strict'

const { NaviModule } = require.main.require('./lib')

class NsfwModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'nswf',
      description: 'NSFW commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = NsfwModule
