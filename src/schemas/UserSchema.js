'use strict'

module.exports = {
  name: 'User',

  schema: {
    userId: {
      type: String,
      index: true,
      unique: true
    },

    settings: {
      type: Object,
      default: {}
    }
  },

  virtuals: {
    connections: {
      ref: 'Connection',
      localField: 'userId',
      foreignField: 'userId'
    },

    gags: {
      ref: 'Gag',
      localField: 'userId',
      foreignField: 'userId'
    },

    warnings: {
      ref: 'Warning',
      localField: 'userId',
      foreignField: 'userId'
    }
  }
}
