'use strict'

module.exports = {
  name: 'Reminder',

  schema: {
    userId: {
      type: String,
      index: true
    },

    message: {
      type: String
    },

    timestamp: {
      type: Date
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
