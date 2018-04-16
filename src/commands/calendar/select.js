'use strict'

const { Command } = require('sylphy')

const R = require('ramda')

class SelectCalendar extends Command {
  constructor (...args) {
    super(...args, {
      name: 'calselect',
      group: 'calendar',
      description: 'Select a calendar to monitor',
      options: {
        guildOnly: true,
        hidden: false
      }
    })
  }

  async handle ({ msg, client }, responder) {
    responder.typing()

    let guildId = msg.channel.guild.id

    let guild = await client.guildManager.get(guildId)

    let list = await guild.getCalendarsForAuth()

    let selection = await responder.selection(R.map(R.prop('name'), list), {
      title: 'Select Calendar'
    })

    responder.typing()

    let item = R.find(R.propEq('name', selection[0]))(list)

    await guild.setCalendar(item.id)

    responder.send('Calendar Selected!')
  }
}

module.exports = SelectCalendar
