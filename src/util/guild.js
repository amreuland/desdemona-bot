'use strict'

const CacheUtils = require('./cache')

class GuildUtils {
  static getGuildPrefix (client, guildId) {
    return CacheUtils.getCachedDBSingle(
      client.db.Guild, client.cache.guild, {
        guildId
      }, `${guildId}:prefix`, `flag:${guildId}:prefix`)
  }
}

module.exports = GuildUtils
