'use strict'

const google = require('googleapis')

const R = require('ramda')

class Guild {
  constructor (guildId, client) {
    this.guildId = guildId
    this.client = client
    this.authClient = null
    this.calendarClient = null
    this._dbObj = null
  }

  async getDBObject () {
    if (this._dbObj) {
      return this._dbObj
    }

    let obj = await this.client.models.Guild.findOne({
      guildId: this.guildId
    })

    if (!obj) {
      obj = new this.client.models.Guild({guildId: this.guildId})
      await obj.save()
    }

    this._dbObj = obj

    return obj
  }

  async getUpcomingEvents () {
    let calendarClient = await this.getCalendarClient()
    let obj = await this.getDBObject()

    let calendarId = obj.calendarId

    let events = await new Promise((resolve, reject) => {
      calendarClient.events.list({
        calendarId,
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      }, (err, {items: data}) => {
        if (err) {
          return reject(err)
        }

        return resolve(data)
      })
    })

    return events
  }

  async getEventDetails (eventId) {
    let calendarClient = await this.getCalendarClient()
    let obj = await this.getDBObject()

    let calendarId = obj.calendarId

    let event = await new Promise((resolve, reject) => {
      calendarClient.events.get({
        calendarId,
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
      let obj = await this.getDBObject()
      this.authClient = this.client.gcal.getAuthClient(obj.authToken)
    }
  }

  async hasAuthToken () {
    let obj = await this.getDBObject()
    return (!!obj.authToken)
  }

  async setCalendar (id) {
    let obj = await this.getDBObject()
    obj.calendarId = id
    return obj.save()
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
      }, (err, {items: data}) => {
        if (err) {
          return reject(err)
        }

        return resolve(data)
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

      let obj = await this.getDBObject()
      obj.authToken = token
      await obj.save()
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
