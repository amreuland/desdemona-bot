'use strict'

const { ObjectId, Mixed } = require('mongoose').Schema.Types

module.exports = {
  name: 'Connection',

  schema: {
    userId: {
      type: String,
      index: true
    },

    guildId: {
      type: String,
      index: true
    },

    type: {
      type: String
    },

    value: {
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
