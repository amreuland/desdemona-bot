'use strict'

class Guild {
  constructor (guildId, client) {
    this.guildId = guildId
    this.client = client
    this.authClient = null
  }

  async getDBObject () {
    let obj = await this.client.models.Guild.findOne({
      guildId: this.guildId
    })

    if (!obj) {
      obj = new this.client.models.Guild({guildId: this.guildId})
      await obj.save()
    }

    return obj
  }

  async getUpcomingEvents () {

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
