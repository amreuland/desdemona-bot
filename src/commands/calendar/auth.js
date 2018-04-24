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

    let google = client.api.google

    return client.db.Guild.findOne({ guildId })
      .then(dbGuild => {
        let authClient = google.getAuthClient()
        let authUrl = google.getAuthUrl(authClient)

        return responder.dialog([{
          prompt: `Authorize the bot by visiting this url: \n\n ${authUrl} \n\n Respond with the code from that page`,
          input: { name: 'response', type: 'string' }
        }])
          .then(response => google.getToken(authClient, response.response))
          .then(token => {
            dbGuild.tokens.google = token
            dbGuild.markModified('tokens')
            return dbGuild.save()
          })
      })
      .then(() => responder.send('Now call !calselect to select a calendar'))
      .catch(err => client.raven.captureException(err))
  }
}

module.exports = AuthCalendar
