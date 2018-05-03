'use strict'

const { NaviModule } = require.main.require('./lib')

class AdminModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'admin',
      description: 'Admin commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = AdminModule
