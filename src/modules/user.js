'use strict'

const { Module } = require('sylphy')

class UserEventsModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'user:events',
      events: {
        'userUpdate': 'onUserUpdate'
      }
    })
  }

  onUserUpdate (user, oldUser) {

  }
}

module.exports = UserEventsModule
