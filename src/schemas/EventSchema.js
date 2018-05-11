'use strict'

module.exports = {
  name: 'Event',

  schema: {
    eventId: {
      type: String,
      index: true
    },

    guildId: {
      type: String,
      index: true
    },

    channelId: {
      type: String,
      index: true
    },

    sentAt: Date,
    endsAt: Date
  },

  virtuals: {
    guild: {
      ref: 'Guild',
      localField: 'guildId',
      foreignField: 'guildId',
      justOne: true
    }
  }
}
