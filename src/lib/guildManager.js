'use strict'

const Guild = require('./guild')

class GuildManager {
  constructor (client) {
    this.client = client
    this.guilds = {}
  }

  async get (guildId) {
    if (!this.guilds[guildId]) {
      let guild = new Guild(guildId, this.client)
      this.guilds[guildId] = guild
      return guild
    }

    return this.guilds[guildId]
  }
}

module.exports = GuildManager
