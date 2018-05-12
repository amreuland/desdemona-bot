'use strict'

const { Mixed } = require('mongoose').Schema.Types

module.exports = {
  name: 'Gag',

  schema: {
    channelId: {
      type: String,
      index: true
    },

    userId: {
      type: String,
      index: true
    },

    guildId: {
      type: String,
      index: true
    },

    timeout: {
      type: Mixed
    }
  },

  virtuals: {
    user: {
      ref: 'User',
      localField: 'userId',
      foreignField: 'userId',
      justOne: true
    },

    guild: {
      ref: 'Guild',
      localField: 'guildId',
      foreignField: 'guildId',
      justOne: true
    }
  }
}
