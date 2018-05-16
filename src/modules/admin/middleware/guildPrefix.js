'use strict'

module.exports = {
  name: 'guildPrefix',
  priority: 49,
  process: container => {
    const { msg, client, isPrivate } = container

    if (isPrivate) {
      return Promise.resolve(container)
    }

    let guildId = msg.channel.guild.id
    let cacheKey = `${guildId}:prefix`
    let flagKey = `flag:${guildId}:prefix`

    return client.cache.guild.get(cacheKey)
      .then(data => {
        if (!data) {
          return client.cache.guild.get(flagKey)
            .then(flag => {
              if (flag) { return null }

              return client.db.Guild.findOne({ guildId })
                .then(dbItem => {
                  if (!dbItem || !dbItem.prefix) {
                    return client.cache.guild.set(flagKey, 1, 'EX', 300)
                      .return(null)
                  }

                  let prefix = dbItem.prefix
                  return client.cache.guild.set(cacheKey, prefix, 'EX', 3600)
                    .return(prefix)
                })
            })
        }

        return data
      })
      .then(prefix => {
        if (prefix) {
          container.guildPrefix = prefix
        }

        return container
      })
  }
}
