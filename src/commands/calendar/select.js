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
        permissions: [
          'administrator'
        ],
        hidden: false
      }
    })
  }

  async handle ({ msg, client }, responder) {
    await responder.typing()

    let google = client.api.google

    let guildId = msg.channel.guild.id
    return client.db.Guild.findOne({guildId: guildId})
      .then(dbGuild => {
        let authClient = google.getAuthClient(dbGuild.tokens.google)
        google.ensureAuthCredentials(authClient)
        return google.getCalendarList(authClient)
          .then(calendars => {
            let options = R.map(R.prop('name'), calendars)
            return responder.selection(options, {
              title: 'Select Calendar'
            }).then(selection => {
              return responder.typing().then(() => {
                let item = calendars[selection[1]]
                dbGuild.calendarId = item.id
                return dbGuild.save()
                  .then(responder.send('Calendar Selected!'))
              })
            })
          })
      })
      .catch(MissingTokenError, () => {
        return responder.error('Missing authentication token for guild!\n\t\t\tPlease call `!calauth` first!')
      })
      .catch(err => client.raven.captureException(err))
  }
}

module.exports = SelectCalendar
