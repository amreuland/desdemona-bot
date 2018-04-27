'use strict'

module.exports = {
  name: 'Copycat',

  schema: {
    guildId: {
      type: String,
      unique: true,
      index: true
    },

    channeld: {
      type: String,
      unique: true,
      index: true
    },

    targets: [
      { type: String, unique: true }
    ]
  }
}
