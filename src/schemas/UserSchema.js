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
    warnings: {
      ref: 'Warning',
      localField: '_id',
      foreignField: 'user'
    }
  }
}
