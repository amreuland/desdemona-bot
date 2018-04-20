'use strict'

const { Command } = require('sylphy')

const { calendarUtil, MissingTokenError } = require('../../util')

class LastCalendarEvent extends Command {
  constructor (...args) {
    super(...args, {
      name: 'lastevent',
      group: 'calendar',
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

    let guild = await client.guildManager.get(guildId)

    await responder.typing()

    let previousEvents = await client.models.Event.find({
      guild: guild.db._id,
      channelId
    }).sort({sentAt: 'desc'})

    if (previousEvents.length < 1) {
      return responder
        .error('there are no previous events for this channel!')
    }

    let lastEvent = previousEvents[0]

    return guild.getEventDetails(lastEvent.eventId)
      .then(event => {
        let params = calendarUtil.getParameters(event)

        let embed = calendarUtil.createEmbed(params)

        return responder.embed(embed).reply('here is the most recent event for this channel')
      })
      .catch(MissingTokenError, () => {
        return responder.error('Missing authentication token for guild!')
      })
  }
}

module.exports = LastCalendarEvent
