'use strict'

const R = require('ramda')
const moment = require('moment')

const { calendarUtil } = require('../util')

function handleEvents () {
  let self = this

  let guildIds = R.keys(self.guildShardMap)

  return Promise.each(guildIds, guildId => {
    return self.guildManager.get(guildId).then(guild => {
      if (!guild.db.calendarId || !guild.db.authToken) {
        return false
      }
      if (guild.db.settings.enableNotifications === false) {
        return false
      }

      let timeAdd = guild.db.settings.timeBefore || 30

      return guild.getUpcomingEvents({
        maxResults: 10,
        timeMax: moment().add(timeAdd, 'minutes').toISOString()
      }).then(events => {
        let eventIds = R.map(R.prop('id'), events)

        Promise.each(self.db.Event.find({
          guild: guild.db._id,
          eventId: {
            $in: eventIds
          }
        }).then(foundEvents => {
          return R.differenceWith((x, y) => {
            return x.id === y.eventId
          }, events, foundEvents)
        }), event => {
          let params = calendarUtil.getParameters(event)

          if (!params) {
            return false
          }

          let foundChannel = R.find(channel => {
            return (!!channel.name) &&
            channel.name.toLowerCase() === params.channel &&
            channel.type === 0
          }, guild.erisObject.channels)

          if (!foundChannel) {
            return false
          }

          let message = '**Hey, Listen!**'

          if (params.role) {
            let foundRole = R.find(role => {
              return role.name.toLowerCase() === params.role &&
              role.mentionable === true
            }, guild.erisObject.roles)

            if (foundRole) {
              message = message + ' ' + foundRole.mention
            }
          }

          let dbEvent = new self.db.Event({
            guild: guild.db._id,
            eventId: params.eventId,
            channelId: foundChannel.id,
            sentAt: new Date(),
            endsAt: params.endDateTime
          })

          let embed = calendarUtil.createEmbed(params)

          self.createMessage(foundChannel.id, {
            content: message,
            embed
          }).then(() => dbEvent.save())
        })
      })
    })
  })
}

module.exports = handleEvents
