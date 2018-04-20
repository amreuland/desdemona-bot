'use strict'

const { Command } = require('sylphy')

const R = require('ramda')

const { MissingTokenError } = require('../../util')

class SelectCalendar extends Command {
  constructor (...args) {
    super(...args, {
      name: 'calselect',
      group: 'calendar',
      description: 'Select a calendar to monitor',
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

    return guild.getCalendarsForAuth()
      .then(calendars => {
        let options = R.map(R.prop('name'), calendars)

        return responder.selection(options, {
          title: 'Select Calendar'
        }).then(selection => {
          return responder.typing().then(() => {
            let item = calendars[selection[1]]
            return guild.setCalendar(item.id)
          }).then(responder.send('Calendar Selected!'))
        })
      })
      .catch(MissingTokenError, () => {
        return responder.error('Missing authentication token for guild!\nPlease call `!calauth` first!')
      })
  }
}

module.exports = SelectCalendar
