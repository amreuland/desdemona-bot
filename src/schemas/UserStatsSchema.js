'use strict'

module.exports = {
  name: 'UserStats',

  schema: {
    userId: {
      type: String,
      index: true
    },

    guildId: {
      type: String,
      index: true
    },

    guildPoints: {
      type: Number,
      default: 0
    },

    guildXp: {
      type: Number,
      default: 0
    },

    addedXp: {
      type: Number,
      default: 0
    }
  },

  virtuals: {
    user: {
      ref: 'User',
      localField: 'userId',
      foreignField: 'userId',
      justOne: true
    },

    guild: {
      ref: 'Guild',
      localField: 'guildId',
      foreignField: 'guildId',
      justOne: true
    }
  }
}
