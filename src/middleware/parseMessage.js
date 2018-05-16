'use strict'

module.exports = {
  name: 'parseMessage',
  priority: 50,
  process: container => {
    const { msg, commands } = container

    return Promise.resolve()
      .then(() => {
        let prefixes = [...commands.prefixes.keys()]
        if (container.guildPrefix && prefixes.indexOf(container.guildPrefix) === -1) {
          prefixes.push(container.guildPrefix)
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

        const rawArgs = msg.content.substring(prefix.length).trim()
          .match(/\\?.|^$/g).reduce((p, c) => {
            if (c === '"') {
              p.quote ^= 1
            } else if (!p.quote && c === ' ') {
              p.a.push('')
            } else {
              p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1')
            }
            return p
          }, {a: ['']}).a
        container.settings.prefix = prefix
        container.trigger = rawArgs[0].toLowerCase()
        container.isCommand = commands.has(container.trigger)
        container.rawArgs = rawArgs.slice(1).filter(v => v)
        return Promise.resolve(container)
      })
  }
}
