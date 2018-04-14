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

  async handle ({ msg, client }, responder) {
    let guildId = msg.channel.guild.id

    let guild = await client.guildManager.get(guildId)

    if (await guild.hasAuthToken()) {
      let selection = await responder.selection(['Yes', 'No'], {
        title: 'Are you sure you want to change the auth ticket?'
      })

      if (selection === 'No') {
        return responder.send('Guild Calendar Auth Cancelled')
      }
    }

    let authUrl = await guild.authGoogle()

    let {response: authCode} = await responder.dialog([
      {
        prompt: `Authorize the bot by visiting this url: \n\n ${authUrl} \n\n Respond with the code from that page`,
        input: { name: 'response', type: 'string', bot: false }
      }
    ])

    await guild.authGoogle(authCode)

    return responder.send('Now call !calselect to select a calendar')
  }
}

module.exports = AuthCalendar
