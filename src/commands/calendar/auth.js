'use strict'

const { Command } = require('sylphy')

class AuthCalendar extends Command {
  constructor (...args) {
    super(...args, {
      name: 'calauth',
      group: 'calendar',
      description: 'Authorize bot to access your calendars',
      options: {
        guildOnly: true,
        hidden: false
      }
    })
  }

  async handle ({ msg }, responder) {
    const dialog = await responder.dialog([
      {
        prompt: 'Please type something!',
        input: { name: 'response', type: 'string', bot: false }
      }
    ], {
      cancel: 'cancel'
    })

    console.log(dialog)

    return dialog
  }
}

module.exports = AuthCalendar
