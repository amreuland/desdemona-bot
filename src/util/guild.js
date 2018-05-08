'use strict'

class GuildUtils {
  static getGuildPrefix (client, guildId) {
    let cache = client.cache.guild
    let model = client.db.Guild
    let cacheKey = `${guildId}:prefix`
    let flagKey = `flag:${guildId}:prefix`
    let dbProps = { guildId }

    return cache.get(cacheKey)
      .then(data => {
        if (!data) {
          return cache.get(flagKey)
            .then(flag => {
              if (flag) { return null }

              return model.findOne(dbProps)
                .then(dbItem => {
                  if (!dbItem || !dbItem.settings.prefix) {
                    return cache.set(flagKey, 1, 'EX', 300)
                      .return(null)
                  }

                  let prefix = dbItem.settings.prefix
                  return cache.set(cacheKey, prefix, 'EX', 3600)
                    .return(prefix)
                })
            })
        }

        return data
      })
  }
}

module.exports = GuildUtils
