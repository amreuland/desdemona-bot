'use strict'

const { Command } = require('sylphy')

const CalendarUtils = require('../util')
const { MissingTokenError } = require('../errors')

class LastCalendarEvent extends Command {
  constructor (...args) {
    super(...args, {
      name: 'lastevent',
      description: 'Get the most recent event in this channel',
      options: {
        guildOnly: true,
        hidden: false,
        cooldown: 15
      }
    })
  }

  async handle ({ msg, client }, responder) {
    let guildId = msg.channel.guild.id
    let channelId = msg.channel.id

    return client.db.Event.find({
      guildId, channelId
    })
      .sort({sentAt: 'desc'})
      .then(previousEvents => {
        if (previousEvents.length < 1) {
          return responder
            .error('there are no previous events for this channel!')
        }

        let lastEvent = previousEvents[0]

        return client.db.Guild.findOne({ guildId })
          .then(dbGuild => {
            let google = client.api.google
            let authClient = google.getAuthClient(dbGuild.tokens.google)
            google.ensureAuthCredentials(authClient)

            return google.getCalendarEventDetails(
              authClient, dbGuild.calendarId, lastEvent.eventId)
          })
      })
      .then(event => {
        let params = CalendarUtils.getParameters(event)

        let embed = CalendarUtils.createEmbed(params)

        return responder.embed(embed).reply('here is the most recent event for this channel')
      })
      .catch(MissingTokenError, () => {
        return responder.error('Missing authentication token for guild!')
      })
  }
}

module.exports = LastCalendarEvent
