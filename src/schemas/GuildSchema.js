'use strict'

module.exports = {
  name: 'Guild',

  schema: {
    guildId: {
      type: String,
      unique: true,
      index: true
    },

    settings: {
      type: Object,
      default: {}
    },

    authToken: Object,

    calendarId: String
  }
}
