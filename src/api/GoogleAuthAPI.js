'use strict'

const google = require('googleapis')
const OAuth2Client = google.auth.OAuth2

class GoogleAuthAPI {
  constructor (clientId, clientSecret, redirectUris) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUris = redirectUris
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
