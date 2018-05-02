'use strict'

module.exports = {
  name: 'Guild',

  schema: {
    guildId: {
      type: String,
      unique: true,
      index: true
    },

    settings: {
      type: Object,
      default: {}
    },

    channels: {
      type: Object,
      default: {}
    },

    tokens: {
      type: Object,
      default: {}
    },

    calendarId: String
  },

  virtuals: {
    connections: {
      ref: 'Connection',
      localField: '_id',
      foreignField: 'guild'
    }
  }
}
