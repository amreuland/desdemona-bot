'use strict'

module.exports = {
  name: 'chatRewards',
  priority: 20,
  process: container => {
    const { msg, client, isPrivate } = container

    if (isPrivate) {
      return Promise.resolve(container)
    }

    let member = msg.member
    let guildId = member.guild.id

    let cacheKey = `chat:${guildId}:${member.id}`

    return client.cache.core.get(cacheKey)
      .then(data => {
        if (data) { return }
        let randomNum = Math.floor(Math.random() * (41)) + 10

        return client.services.Money.addUserMoney(member, randomNum)
      })
      .then(() => container)
  }
}
