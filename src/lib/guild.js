'use strict'

class Guild {
  constructor (guildId, client) {
    this.guildId = guildId
    this.client = client
    this._authToken = null
  }

  get authToken () {
    if (!this._authToken) {
      console.log(this.getDBObject())
    }
  }

  set authToken (token) {
    this._authToken = token
    this.updateDBObject({token})
  }

  async updateDBObject (data) {
    let obj = this.getDBObject()
    return this.client.models.update({_id: obj._id}, data)
  }

  async getDBObject () {
    let obj = await this.client.models.guild.findOrCreate({
      guildId: this.guildId
    }, {
      guildId: this.guildId
    })

    console.log(obj)

    return obj
  }

  _ensureAuthClient () {
    if (!this.authClient) {
      this.authClient = this.client.gcal.getAuthClient(this.authToken)
    }
  }

  checkGoogleAuth () {
    this._ensureAuthClient()
  }

  authGoogle (code) {
    if (code) {}
  }
}

module.exports = Guild
