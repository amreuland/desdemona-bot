'use strict'

const { NaviModule } = require.main.require('./lib')

class PermissionsModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'permissions',
      description: 'Permissions commands and components'
    })
  }

  getModulePath () { return __dirname }
}

module.exports = PermissionsModule
