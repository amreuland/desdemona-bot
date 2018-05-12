'use strict'

const { ObjectId } = require('mongoose').Schema.Types

module.exports = {
  name: 'SelfAssignedRole',

  schema: {
    guildId: {
      type: String,
      index: true
    },

    roleId: {
      type: String,
      index: true
    },

    group: {
      type: Number
    }
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
