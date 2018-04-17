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

    sentAt: Date,
    endsAt: Date
  }
}
