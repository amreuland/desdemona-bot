'use strict'

const google = require('googleapis')
const OAuth2Client = google.auth.OAuth2

const { Interface } = require('../lib')

class GoogleAuthAPI extends Interface {
  constructor (options = {}) {
    super({
      name: 'google'
    })

    this.clientId = options.client_id
    this.clientSecret = options.client_secret
    this.redirectUris = options.redirect_uris
    if (!this.clientId || !this.clientSecret || !this.redirectUris) {
      throw new Error('Missing Google OAuth Client Secret')
    }
  }

  getAuthClient (token) {
    let client = new OAuth2Client(this.clientId, this.clientSecret, this.redirectUris[0])
    if (token) {
      client.credentials = token
    }

    return client
  }
}

module.exports = GoogleAuthAPI
