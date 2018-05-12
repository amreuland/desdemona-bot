'use strict'

module.exports = {
  name: 'Warning',

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
  },

  virtuals: {
    user: {
      ref: 'User',
      localField: 'userId',
      foreignField: 'userId',
      justOne: true
    }
  }
}
