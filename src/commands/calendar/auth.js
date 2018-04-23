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

    if (guild.hasAuthToken()) {
      let selection = await responder.selection(['Yes', 'No'], {
        title: 'Are you sure you want to change the auth ticket?'
      })

      if (selection[0] !== 'Yes') {
        return responder.send('Guild Calendar Auth Cancelled')
      }
    }

    return responder.typing()
      .then(() => guild.authGoogle())
      .then(authUrl => {
        return responder.dialog([
          {
            prompt: `Authorize the bot by visiting this url: \n\n ${authUrl} \n\n Respond with the code from that page`,
            input: { name: 'response', type: 'string', bot: false }
          }
        ])
      })
      .tap(responder.typing())
      .then(response => guild.authGoogle(response.response))
      .then(responder.send('Now call !calselect to select a calendar'))
      .catch(err => client.raven.captureException(err))
  }
}

module.exports = AuthCalendar
