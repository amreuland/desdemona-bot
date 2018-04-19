'use strict'

const R = require('ramda')

const Guild = require('./Guild')

class GuildManager {
  constructor (client) {
    this.client = client
    this.guilds = {}
  }

  get (guildId) {
    if (!this.guilds[guildId]) {
      let guild = new Guild(guildId, this.client)
      this.guilds[guildId] = guild
      return guild.populateDBObj().then(() => guild)
    }

    return Promise.resolve(this.guilds[guildId])
  }

  getSubset (guilds) {
    return R.map(this.get.bind(this), guilds)
  }

  getAllGuilds () {
    return R.values(this.guilds)
  }
}

module.exports = GuildManager
