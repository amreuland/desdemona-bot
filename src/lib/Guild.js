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

  getUpcomingEvents (options = {}) {
    let cfg = {
      calendarId: this.db.calendarId,
      timeMin: moment().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    }

    cfg = R.merge(options, cfg)

    return this.getCalendarClient().then(calendarClient => {
      return Promise.promisify(calendarClient.events.list)(cfg).then(data => {
        return data.items
      })
    })
  }

  getEventDetails (eventId) {
    // var self = this
    return this.getCalendarClient().then(calendarClient => {
      return Promise.promisify(calendarClient.events.get)({
        calendarId: this.db.calendarId,
        eventId
      })
    })
  }

  _ensureAuthClient () {
    if (!this.authClient) {
      this.authClient = this.client.gcal.getAuthClient(this.db.authToken)
    }
  }

  hasAuthToken () {
    return (!!this.db.authToken)
  }

  setCalendar (id) {
    this.db.calendarId = id
    return this.db.save()
  }

  getCalendarClient () {
    if (!this.hasAuthToken()) {
      return Promise.reject(new Error('No auth token'))
    }

    this._ensureAuthClient()

    if (!this.calendarClient) {
      this.calendarClient = google.calendar({version: 'v3', auth: this.authClient})
    }

    return Promise.resolve(this.calendarClient)
  }

  getCalendarsForAuth () {
    if (!this.hasAuthToken()) {
      return Promise.resolve([])
    }

    this._ensureAuthClient()

    return this.getCalendarClient().then(calendarClient => {
      return Promise.promisify(calendarClient.calendarList.list)({
        maxResults: 10
      }).then(data => {
        return R.map(item => {
          return {
            id: item.id,
            name: item.summary
          }
        }, data.items)
      })
    })
  }

  async authGoogle (code) {
    this._ensureAuthClient()

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
