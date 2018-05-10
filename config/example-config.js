'use strict'

module.exports = {
  env: 'development',

  admins: [],

  cluster: {
    startId: 0,
    processCount: 1,
    shardsPerProcess: 1
  },

  cache: {
    audit: {
      host: 'localhost',
      db: 3,
      keyPrefix: 'audit:'
    },

    copycat: {
      host: 'localhost',
      db: 3,
      keyPrefix: 'copycat:'
    },

    guild: {
      host: 'localhost',
      db: 3,
      keyPrefix: 'guild:'
    },

    mod: {
      host: 'localhost',
      db: 3,
      keyPrefix: 'mod:'
    }
  },

  bot: {
    token: '',
    prefix: 'n!'
  },

  calendar: {
    pollingRate: 30
  },

  mongo: {
    uri: 'mongodb://localhost/navi'
  },

  apis: {
    google: {
      apiKey: '',

      clientId: '',
      clientSecret: '',
      redirectUris: ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost'],

      options: {
        cx: ''
      }
    },

    steam: {
      apiKey: ''
    },

    thecatapi: ''
  },

  sentry: {
    dsn: '',
    options: {
      captureUnhandledRejections: true,
      autoBreadcrumbs: {
        console: false,
        http: false
      }
    }
  }
}
