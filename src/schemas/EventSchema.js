'use strict'

const mongoose = require('mongoose')

module.exports = {
  name: 'Event',

  schema: {
    eventId: String,

    guild: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guild'
    },

    channelId: String,

    sentAt: Date,
    endsAt: Date
  }
}
