'use strict'

const moment = require('moment')
const R = require('ramda')

const google = require('googleapis')
const OAuth2Client = google.auth.OAuth2

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

const { MissingTokenError } = require('../lib')

class GoogleAPI {
  constructor (options = {}) {
    this.apiKey = options.apiKey
    this.clientId = options.clientId
    this.clientSecret = options.clientSecret
    this.redirectUris = options.redirectUris
    if (!this.apiKey) {
      throw new Error('Missing Google API Key')
    }

    if (!this.clientId || !this.clientSecret || !this.redirectUris) {
      throw new Error('Missing Google OAuth Client Secret')
    }

    // google.client.setApiKey(this.apiKey)

    let calendar = google.calendar({version: 'v3'})
    let customsearch = google.customsearch({
      version: 'v1',
      auth: this.apiKey
    })
    let youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey
    })

    Promise.promisifyAll(calendar.calendarList)
    Promise.promisifyAll(calendar.calendars)
    Promise.promisifyAll(calendar.events)

    this.calendar = calendar

    Promise.promisifyAll(customsearch.cse)

    this.customsearch = customsearch

    Promise.promisifyAll(youtube.search)

    this.youtube = youtube
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

  getGoogleSearch (query) {
    return this.customsearch.cse.listAsync({
      q: query
    })
  }

  // //////////////////
  // YOUTUBE METHODS //
  // //////////////////

  getYouTubeSearch (query) {
    return this.youtube.search.listAsync({
      part: 'snippet',
      q: query,
      type: 'video,playlist'
    })
  }
}

module.exports = GoogleAPI
