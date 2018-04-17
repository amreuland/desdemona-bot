'use strict'

const { Command } = require('sylphy')

class CalendarEvents extends Command {
  constructor (...args) {
    super(...args, {
      name: 'calevents',
      group: 'calendar',
      description: 'Get Calendar Events',
      options: {
        guildOnly: true,
        requirements: {
          permissions: {
            administrator: true
          }
        },
        hidden: false
      }
    })
  }

  async handle ({ msg, client }, responder) {
    responder.typing()

    let guildId = msg.channel.guild.id

    let guild = await client.guildManager.get(guildId)

    await guild.getUpcomingEvents()

    return responder.send('hi')
  }
}

module.exports = CalendarEvents
