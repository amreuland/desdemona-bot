'use strict'

module.exports = {
  name: 'Guild',

  schema: {
    guildId: {
      type: String,
      unique: true,
      index: true
    },

    prefix: {
      type: String
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
    }
  },

  virtuals: {
    connections: {
      ref: 'Connection',
      localField: '_id',
      foreignField: 'guild'
    }
  }
}
