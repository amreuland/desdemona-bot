'use strict'

const { SilenceService } = require('../services')

function hasPermissions (member, ...perms) {
  for (const perm of perms) {
    if (!member.permission.has(perm)) return false
  }
  return true
}

module.exports = {
  name: 'lockdown',
  priority: 5,
  process: container => {
    const { msg, client, isPrivate } = container

    if (isPrivate) {
      return Promise.resolve(container)
    }

    let channel = msg.channel

    return SilenceService.isChannelInLockdown(client, channel)
      .then(result => {
        if (!result) {
          return container
        }

        let member = msg.member
        if (hasPermissions(member, ['manageMessages'])) {
          return container
        }

        return msg.delete('Channel in lockdown').return(null)
      })
  }
}
