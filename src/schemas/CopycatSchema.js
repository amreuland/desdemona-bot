'use strict'

module.exports = {
  name: 'Copycat',

  schema: {
    guildId: {
      type: String,
      index: true
    },

    channelId: {
      type: String,
      unique: true,
      index: true
    },

    targets: [
      { type: String }
    ]
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
