'use strict'

module.exports = {
  name: 'User',

  schema: {
    userId: {
      type: String,
      index: true,
      unique: true
    },

    money: {
      type: Number,
      default: 0
    },

    globalXp: {
      type: Number,
      default: 0
    },

    reputation: {
      type: Number,
      default: 0
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
    },

    guildStats: {
      ref: 'UserStats',
      localField: 'userId',
      foreignField: 'userId'
    }
  }
}
