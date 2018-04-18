'use strict'

module.exports = {
  version: '0.0.1',

  env: 'development',

  bot: {
    token: 'NDM2MTUzMjk3MjA4OTk5OTM2.DbjW7g.Ynkpdbdl9pOT7Vy6HcmEhyfC2JU'
  },

  mongo: {
    uri: 'mongodb://localhost/desdemona_bot_test'
  },

  sentry: {
    dsn: 'https://0047da8c7269416a821a89e004e1713a:f6e7bcde498e45c5a757b1629c14548b@sentry.asrl.io/5',
    options: {
      captureUnhandledRejections: true,
      autoBreadcrumbs: {
        console: false,
        http: true
      }
    }
  }
}
