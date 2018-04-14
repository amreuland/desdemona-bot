'use strict'

const google = require('googleapis')
const OAuth2Client = google.auth.OAuth2
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

class GoogleCalendarAPI {
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

  getAuthUrl (client) {
    return new Promise((resolve, reject) => {
      let authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
      })

      return resolve(authUrl)
    })
  }

  getTokenFromCode (client, code) {
    return new Promise((resolve, reject) => {
      client.getToken(code, (err, token) => {
        if (err) {
          return reject(err)
        }

        return resolve(token)
      })
    })
  }
}

module.exports = GoogleCalendarAPI
