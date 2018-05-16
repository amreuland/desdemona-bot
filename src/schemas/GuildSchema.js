'use strict'

module.exports = {
  name: 'Guild',

  schema: {
    guildId: {
      type: String,
      unique: true,
      index: true
    },

    prefix: {
      type: String
    },

    settings: {
      type: Object,
      default: {}
    },

    channels: {
      type: Object,
      default: {}
    },

    tokens: {
      type: Object,
      default: {}
    }
  },

  virtuals: {
    connections: {
      ref: 'Connection',
      localField: 'guildId',
      foreignField: 'guildId'
    },

    gags: {
      ref: 'Gag',
      localField: 'guildId',
      foreignField: 'guildId'
    },

    selfAssignedRoles: {
      ref: 'SelfAssignedRole',
      localField: 'guildId',
      foreignField: 'guildId'
    },

    userStats: {
      ref: 'UserStats',
      localField: 'guildId',
      foreignField: 'guildId'
    },

    warnings: {
      ref: 'Warning',
      localField: 'guildId',
      foreignField: 'guildId'
    }
  }
}
