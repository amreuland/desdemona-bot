'use strict'

const { Command } = require('sylphy')

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

  }
}

module.exports = SelectCalendar
