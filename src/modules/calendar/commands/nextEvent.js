'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const CalendarUtils = require('../util')
const { MissingTokenError } = require.main.require('./lib')

class NextCalendarEvent extends Command {
  constructor (...args) {
    super(...args, {
      name: 'nextevent',
      description: 'Get the closest upcoming event in this channel',
      cooldown: 15,
      options: {
        guildOnly: true,
        hidden: false
      }
    })
  }

  async handle ({ msg, client }, responder) {
    let guildId = msg.channel.guild.id
    let channelName = msg.channel.name.toLowerCase()

    await responder.typing()

    let google = client.api.google

    return client.db.Guild.findOne({ guildId })
      .populate('connections')
      .then(dbGuild => {
        let authClient = google.getAuthClient(dbGuild.tokens.google)
        google.ensureAuthCredentials(authClient)

        let connection = R.find(R.propEq('type', 'google#calendarId'), dbGuild.connections)

        return google.getCalendarUpcomingEvents(authClient, connection.value)
      })
      .then(upcomingEvents => {
        let params = null

        let nextEvent = R.find(event => {
          params = CalendarUtils.getParameters(event)
          if (!params || !params.channel) {
            return false
          }

          if (params.channel !== channelName) {
            return false
          }

          return true
        }, upcomingEvents)

        if (!nextEvent) {
          return responder.error('there are no upcoming events for this channel!')
        }

        let embed = CalendarUtils.createEmbed(params)

        return responder
          .embed(embed)
          .reply('here is the closest upcoming event for this channel')
      })
      .catch(MissingTokenError, () => {
        return responder.error('Missing authentication token for guild!')
      })
  }
}

module.exports = NextCalendarEvent
