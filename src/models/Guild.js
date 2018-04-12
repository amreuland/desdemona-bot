'use strict'

module.exports = {
  identity: 'guild',

  datastore: 'default',

  primaryKey: 'id',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true
    },

    guildId: {
      type: 'string'
    },

    authToken: {
      type: 'string'
    },

    calendarId: {
      type: 'string'
    }
  }
}
