'use strict'

const { ObjectId } = require('mongoose').Schema.Types

module.exports = {
  name: 'GUSettings',

  schema: {
    user: {
      type: ObjectId,
      ref: 'User'
    },

    guild: {
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

    settings: {
      type: Object,
      default: {}
    }
  }
}
