'use strict'

const { getGuildPrefix } = require('../util').GuildUtils

module.exports = {
  name: 'parseMessage',
  priority: 10,
  process: container => {
    const { msg, client, commands } = container

    // let foundPrefix
    // let actOnMsg = false

    // const mentionPrefix = msg.content.match(new RegExp(`^<@!*${client.user.id}>`))

    // if (msg.content.startsWith(mentionPrefix)) {
    //   foundPrefix = mentionPrefix + ' '
    //   actOnMsg = true
    // }

    // let p

    // if (!actOnMsg) {
    let p = Promise.resolve(null)
    if (msg.channel.guild) {
      p = getGuildPrefix(client, msg.channel.guild.id)
    }

    return p
      .then(gPrefix => {
        let prefixes = [...commands.prefixes.keys()]
        if (gPrefix && prefixes.indexOf(gPrefix) === -1) {
          prefixes.push(gPrefix)
        }
        for (const prefix of prefixes) {
          if (!msg.content.startsWith(prefix)) {
            continue
          }

          return prefix
        }

        return null
      })
      .then(prefix => {
        if (!prefix) {
          return Promise.resolve()
        }

        const rawArgs = msg.content.substring(prefix.length).trim().split(' ')
        container.settings.prefix = prefix
        container.trigger = rawArgs[0].toLowerCase()
        container.isCommand = commands.has(container.trigger)
        container.rawArgs = rawArgs.slice(1).filter(v => v)
        return Promise.resolve(container)
      })
    // } else {
    //   p = Promise.resolve(foundPrefix)
    // }

    // if (!actOnMsg) {
    //   return Promise.resolve()
    // }

    // return p
  }
}
