'use strict'

const google = require('googleapis')
const moment = require('moment')
const R = require('ramda')

class Guild {
  constructor (guildId, client) {
    this.id = guildId
    this.client = client
    this.authClient = null
    this.calendarClient = null
    this.db = null
  }

  get erisObject () {
    return this.client.guilds.get(this.id)
  }

  getGuildId () { return this.id }

  getDBObject () { return this.db }

  async populateDBObj () {
    if (this.db) {
      return
    }

    let obj = await this.client.models.Guild.findOne({
      guildId: this.id
    })

    if (!obj) {
      obj = new this.client.models.Guild({guildId: this.id})
      await obj.save()
    }

    this.db = obj

    // return obj
  }

  async getUpcomingEvents (options = {}) {
    let calendarClient = await this.getCalendarClient()

    let cfg = {
      calendarId: this.db.calendarId,
      timeMin: moment().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    }

    cfg = R.merge(options, cfg)

    let events = await new Promise((resolve, reject) => {
      calendarClient.events.list(cfg, (err, data) => {
        if (err) {
          return reject(err)
        }

        return resolve(data.items)
      })
    })

    return events
  }

  async getEventDetails (eventId) {
    let calendarClient = await this.getCalendarClient()

    let event = await new Promise((resolve, reject) => {
      calendarClient.events.get({
        calendarId: this.db.calendarId,
        eventId
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        return resolve(data)
      })
    })

    return event
  }

  async _ensureAuthClient () {
    if (!this.authClient) {
      this.authClient = this.client.gcal.getAuthClient(this.db.authToken)
    }
  }

  async hasAuthToken () {
    return (!!this.db.authToken)
  }

  async setCalendar (id) {
    this.db.calendarId = id
    return this.db.save()
  }

  async getCalendarClient () {
    if (!await this.hasAuthToken()) {
      return new Error('No auth token')
    }

    await this._ensureAuthClient()

    if (!this.calendarClient) {
      this.calendarClient = google.calendar({version: 'v3', auth: this.authClient})
    }

    return this.calendarClient
  }

  async getCalendarsForAuth () {
    if (!await this.hasAuthToken()) {
      return []
    }

    await this._ensureAuthClient()

    let calendarClient = await this.getCalendarClient()

    let calendars = await new Promise((resolve, reject) => {
      calendarClient.calendarList.list({
        maxResults: 10
      }, (err, data) => {
        if (err) {
          return reject(err)
        }

        return resolve(data.items)
      })
    })

    let calendarList = R.map(item => {
      return {
        id: item.id,
        name: item.summary
      }
    }, calendars)

    return calendarList
  }

  async authGoogle (code) {
    await this._ensureAuthClient()
    if (code) {
      let self = this
      let token = await new Promise((resolve, reject) => {
        self.authClient.getToken(code, (err, token) => {
          if (err) { return reject(err) }
          return resolve(token)
        })
      })

      this.db.authToken = token
      await this.db.save()
      this.authClient.credentials = token
      this.calendarClient = null
      return token
    } else {
      let authUrl = this.authClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.readonly']
      })
      return authUrl
    }
  }
}

module.exports = Guild
