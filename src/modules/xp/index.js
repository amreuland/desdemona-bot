'use strict'

const { NaviModule } = require.main.require('./lib')

class XPModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'xp',
      description: 'XP (experience) commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = XPModule
