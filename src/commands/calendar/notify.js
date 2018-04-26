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
        permissions: {
          administrator: true
        },
        hidden: false
      }
    })
  }

  async handle ({ msg, client }, responder) {
    await responder.typing()

    let guildId = msg.channel.guild.id

    let options = ['enable', 'disable']

    return client.db.Guild.findOne({ guildId })
      .then(dbGuild => {
        return responder.selection(options, {
          title: 'Enable or Disable notifications'
        })
          .then(response => {
            dbGuild.settings.enableNotifications = (response[0] === 'enable')
            dbGuild.markModified('settings')
            return dbGuild.save()
              .then(responder.success(`Calendar notifications have been ${response[0]}d`))
          })
      })
      .catch(err => client.raven.captureException(err))
  }
}

module.exports = CalendarNotifications
