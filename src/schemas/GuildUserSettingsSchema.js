'use strict'

module.exports = {
  name: 'GUSettings',

  schema: {
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
