'use strict'

module.exports = {
  name: 'Copycat',

  schema: {
    guildId: {
      type: String,
      unique: true,
      index: true
    },

    channels: {
      type: Object,
      default: {}
    }
  }
}
