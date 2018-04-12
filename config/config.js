'use strict'

const sailsMongoAdapter = require('sails-mongo')

module.exports = {
  version: '0.0.1',

  bot: {
    token: 'NDIxMzE3NjI2MzUwNzk2ODIw.DYLhrw.Y0eG5JtFgAtp1bWz3qRZXERCc9o'
  },

  waterline: {
    adapters: {
      'sails-mongo': sailsMongoAdapter
    },

    datastores: {
      default: {
        adapter: 'sails-mongo',
        url: 'mongodb://localhost/desdemona_bot'
      }
    }
  },

  sentry: {
    dsn: 'https://8c73bab577fc4b5eae2b9cdb61946024:efb6d4d47f6d453eb640cab22c7a880c@sentry.asrl.io/5',
    options: {
      captureUnhandledRejections: true,
      autoBreadcrumbs: {
        console: false,
        http: true
      }
    }
  }
}
