'use strict'

module.exports = {
  name: 'parseMessage',
  priority: 10,
  process: container => {
    const { msg, client, commands } = container

    let foundPrefix = null
    let actOnMsg = false

    const mentionPrefix = msg.content.match(new RegExp(`^<@!*${client.user.id}>`))

    if (msg.content.startsWith(mentionPrefix)) {
      foundPrefix = mentionPrefix + ' '
      actOnMsg = true
    }

    if (!actOnMsg) {
      let prefixes = commands.prefixes.keys()
      for (const prefix of prefixes) {
        if (!msg.content.startsWith(prefix)) {
          continue
        }

        foundPrefix = prefix
        actOnMsg = true
        break
      }
    }

    if (!actOnMsg) {
      return Promise.resolve()
    }

    const rawArgs = msg.content.substring(foundPrefix.length).trim().split(' ')
    container.settings.prefix = foundPrefix
    container.trigger = rawArgs[0].toLowerCase()
    container.isCommand = commands.has(container.trigger)
    container.rawArgs = rawArgs.slice(1).filter(v => v)
    return Promise.resolve(container)
  }
}
