'use strict'

class Guild {
  constructor (guildId, client) {
    this.guildId = guildId
    this.client = client
    this._authToken = null
    this._dbObject = null
  }

  // get authToken () {
  //   if (!this._authToken) {
  //     console.log(this.getDBObject())
  //   }
  // }

  set authToken (token) {
    this._authToken = token
    this.updateDBObject({token})
  }

  async updateDBObject (data) {
    let obj = this.getDBObject()
    return this.client.models.Guild.update({_id: obj._id}, data)
  }

  async getDBObject () {
    if (this._dbObject) {
      return this._dbObject
    }

    let self = this
    return await this.client.models.Guild.findOne({
      guildId: self.guildId
    }).then(obj => {
      if (!obj) {
        self._dbObject = new this.client.models.Guild({guildId: self.guildId})
        return self._dbObject.save().then(() => {
          return self._dbObject
        })
      }
    })
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
