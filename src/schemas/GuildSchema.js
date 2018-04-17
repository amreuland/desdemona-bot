'use strict'

module.exports = {
  name: 'Guild',

  schema: {
    guildId: {
      type: String,
      unique: true
    },

    authToken: Object,

    calendarId: String
  }
}
