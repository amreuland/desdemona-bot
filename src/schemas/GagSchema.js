'use strict'

const { ObjectId, Mixed } = require('mongoose').Schema.Types

module.exports = {
  name: 'Gag',

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

    timeout: {
      type: Mixed
    }
  }
}
