'use strict'

const moment = require('moment')
const R = require('ramda')

const google = require('googleapis')
const OAuth2Client = google.auth.OAuth2

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

const { Interface } = require('../lib')
const { MissingTokenError } = require('../util')

class GoogleAPI extends Interface {
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

    let calendar = google.calendar({version: 'v3'})

    Promise.promisifyAll(calendar.calendarList)
    Promise.promisifyAll(calendar.calendars)
    Promise.promisifyAll(calendar.events)

    this.calendar = calendar
  }

  // ///////////////
  // CORE METHODS //
  // ///////////////

  getAuthClient (token) {
    let client = new OAuth2Client(this.clientId, this.clientSecret, this.redirectUris[0])
    if (token) {
      client.credentials = token
    }

    return client
  }

  ensureAuthCredentials (auth) {
    if (!auth.credentials.access_token) {
      throw new MissingTokenError()
    }

    return auth
  }

  getAuthUrl (auth) {
    return auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })
  }

  getToken (auth, code) {
    return new Promise((resolve, reject) => {
      auth.getToken(code, (err, token) => {
        if (err) {
          return reject(err)
        }
        return resolve(token)
      })
    })
  }

  // ///////////////////
  // CALENDAR METHODS //
  // ///////////////////

  /**
   * Returns entries on the user's calendar list
   * @see Google Calendar {@link http://google.github.io/google-api-nodejs-client/classes/_apis_calendar_v3_.resource_calendarlist.html#list}
   * @param  {AxiosBasicCredentials} auth credentials
   * @return {Promise}      A promise
   */
  getCalendarList (auth) {
    return this.calendar.calendarList.listAsync({ auth })
  }

  getCalendarEventDetails (auth, calendarId, eventId) {
    return this.calendar.events.getAsync({
      auth, calendarId, eventId
    })
  }

  getCalendarUpcomingEvents (auth, calendarId, options = {}) {
    let cfg = {
      auth,
      calendarId,
      timeMin: moment().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    }

    cfg = R.merge(options, cfg)

    return this.calendar.events.listAsync(cfg).then(data => data.items)
  }
}

module.exports = GoogleAPI
