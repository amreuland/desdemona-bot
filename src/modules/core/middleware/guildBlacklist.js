'use strict'

module.exports = {
  name: 'guildBlacklistCheck',
  priority: 38,
  process: container => {
    const { msg, client, isPrivate } = container

    if (isPrivate) {
      return Promise.resolve(container)
    }

    let guildId = msg.channel.guild.id

    return client.services.Blacklist.isGuildBlacklisted(guildId)
      .then(data => {
        if (data) { return null }
        return container
      })
  }
}
