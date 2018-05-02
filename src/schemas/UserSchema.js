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
      localField: '_id',
      foreignField: 'user'
    },

    warnings: {
      ref: 'Warning',
      localField: '_id',
      foreignField: 'user'
    }
  }
}
