'use strict'

const { NaviModule } = require.main.require('./lib')

class SocialModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'social',
      description: 'Social stuff'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = SocialModule
