'use strict'

const { ObjectId, Mixed } = require('mongoose').Schema.Types

module.exports = {
  name: 'Connection',

  schema: {
    user: {
      type: ObjectId,
      ref: 'User'
    },

    guild: {
      type: ObjectId,
      ref: 'Guild'
    },

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
  }
}
