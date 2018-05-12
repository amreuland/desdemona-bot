'use strict'

const { Mixed } = require('mongoose').Schema.Types

module.exports = {
  name: 'ProviderToken',

  schema: {
    guildId: {
      type: String,
      index: true
    },

    userId: {
      type: String,
      index: true
    },

    provider: {
      type: String
    },

    token: {
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
