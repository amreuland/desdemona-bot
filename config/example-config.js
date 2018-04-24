'use strict'

module.exports = {
  env: 'development',

  bot: {
    token: ''
  },

  mongo: {
    uri: ''
  },

  calendar: {
    pollingRate: 30
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
