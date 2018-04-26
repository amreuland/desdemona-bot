'use strict'

const { Module } = require('sylphy')

class CopycatModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'copycat:logic',
      events: {
        'messageCreate': 'onMessageCreate'
      }
    })
  }

  onMessageCreate (message) {

  }
}

module.exports = CopycatModule
