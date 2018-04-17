'use strict'

const { Command } = require('sylphy')

class CalendarNotifications extends Command {
  constructor (...args) {
    super(...args, {
      name: 'calnotify',
      group: 'calendar',
      description: 'Enable or disable Calendar notifications',
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
    await responder.typing()

    let guildId = msg.channel.guild.id

    let guild = await client.guildManager.get(guildId)

    let options = ['enable', 'disable']

    await guild.populateDBObj()

    let [response, _] = await responder.selection(options, {
      title: 'Enable or Disable notifications'
    })

    guild.db.enableNotifications = (response === 'enable')

    await guild.db.save()

    return responder.send(`:white_check_mark: Calendar notifications have been ${response}d`)
  }
}

module.exports = CalendarNotifications
