'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const { calendarUtil, MissingTokenError } = require('../../util')

class NextCalendarEvent extends Command {
  constructor (...args) {
    super(...args, {
      name: 'nextevent',
      group: 'calendar',
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

    let guild = await client.guildManager.get(guildId)

    await responder.typing()

    return guild.getUpcomingEvents()
      .then(upcomingEvents => {
        let params = null

        let nextEvent = R.find(event => {
          params = calendarUtil.getParameters(event)
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

        let embed = calendarUtil.createEmbed(params)

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
