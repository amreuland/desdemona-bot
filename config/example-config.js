'use strict'

module.exports = {
  cluster: {
    startId: 0,
    processCount: 1,
    shardsPerProcess: 1
  },

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
