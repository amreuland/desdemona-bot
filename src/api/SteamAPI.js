const idReg = /^\d{17}$/

const steamapi = require('steamapi')

const playerSummary = require('steamapi/src/structures/PlayerSummary')

class SteamAPI extends steamapi {
  constructor (key, ...args) {
    if (!key) {
      throw new Error('Missing Steam Web API Key')
    }

    super(key, ...args)
  }

  getUserSummary (id) {
    const arr = Array.isArray(id)
    if ((arr && id.some(i => !idReg.test(i))) || (!arr && !idReg.test(id))) {
      return Promise.reject(new TypeError('Invalid/no id provided'))
    }

    return this
      .get(`/ISteamUser/GetPlayerSummaries/v2?steamids=${id}`)
      .then(json => json.response.players.length
        ? arr
          ? json.response.players.map(player => new PlayerSummary(player))
          : new PlayerSummary(json.response.players[0])
        : Promise.reject(new Error('No players found'))
      )
  }
}

class PlayerSummary extends playerSummary {
  constructor (player) {
    super(player)

    if (this.visibilityState !== 3) {
      return
    }

    this.realName = player.realname
    this.primaryClanId = player.primaryclanid
    this.timecreated = player.timecreated
    this.gameId = player.gameid
    this.gameServerIp = player.gameserverip
    this.gameExtraInfo = player.gameextrainfo
    this.locCountryCode = player.loccountrycode
    this.locStateCode = player.locstatecode
    this.locCityId = player.loccityid
  }
}

module.exports = SteamAPI
