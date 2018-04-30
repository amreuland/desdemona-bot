'use strict'

const ObjectId = require('mongoose').Schema.Types.ObjectId

module.exports = {
  name: 'Warning',

  schema: {
    user: {
      type: ObjectId,
      ref: 'User'
    },

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

    timestamp: {
      type: Date
    },

    moderatorId: {
      type: String
    },

    forgiven: {
      type: Boolean,
      default: false
    }
  }
}
