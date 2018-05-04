'use strict'

const { NaviModule } = require.main.require('./lib')

class CalendarModule extends NaviModule {
  constructor (...args) {
    super(...args, {
      name: 'calendar',
      description: 'Calendar commands and components',
      listeners: false
    })
  }

  getModulePath () { return __dirname }
}

module.exports = CalendarModule
