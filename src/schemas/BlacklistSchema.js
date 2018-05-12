'use strict'

const { Mixed } = require('mongoose').Schema.Types

module.exports = {
  name: 'Blacklist',

  schema: {
    userId: {
      type: String,
      index: true
    },

    guildId: {
      type: String,
      index: true
    },

    reason: {
      type: String
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
