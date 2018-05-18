'use strict'

module.exports = {
  name: 'userBlacklistCheck',
  priority: 39,
  process: container => {
    const { msg, client } = container

    let userId = msg.author.id

    return client.services.Blacklist.isUserBlacklisted(userId)
      .then(data => {
        if (data) { return null }
        return container
      })
  }
}
