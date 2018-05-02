'use strict'

class GuildUtils {
  static getGuildPrefix (client, guildId) {
    return client.cache.guild.get(`${guildId}:prefix`)
  }
}

module.exports = GuildUtils
