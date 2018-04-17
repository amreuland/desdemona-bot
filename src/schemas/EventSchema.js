'use strict'

module.exports = {
  name: 'Event',

  schema: {
    eventId: {
      type: String
    },

    guildId: {
      type: String
    },

    sentAt: Date
  }
}
