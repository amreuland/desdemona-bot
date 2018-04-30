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
      { type: String, unique: true }
    ]
  }
}
