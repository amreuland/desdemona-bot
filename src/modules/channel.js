'use strict'

const { Module } = require('sylphy')

class ChannelEventsModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'channel:events',
      events: {
        'channelCreate': 'onChannelCreate',
        'channelDelete': 'onChannelDelete',
        'channelPinUpdate': 'onChannelPinUpdate',
        'channelUpdate': 'onChannelUpdate'
      }
    })
  }

  onChannelCreate (channel) {

  }

  onChannelDelete (channel) {

  }

  onChannelPinUpdate (channel, timestamp, oldTimestamp) {

  }

  onChannelUpdate (channel, oldChannel) {

  }
}

module.exports = ChannelEventsModule
