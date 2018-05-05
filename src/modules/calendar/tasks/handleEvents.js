'use strict'

const R = require('ramda')
const moment = require('moment')

const CalendarUtils = require('../util')

const { NaviTask } = require.main.require('./lib')

class HandleEventsTask extends NaviTask {
  constructor (opts) {
    super({
      name: 'handleEvents',
      interval: 30000
    })
  }

  run (client) {
    let guildIds = R.keys(client.guildShardMap)

    let google = client.api.google

    return Promise.map(guildIds, guildId => {
      return client.db.Guild.findOne({ guildId })
        .populate('connections')
        .then(dbGuild => {
          if (!dbGuild || !dbGuild.tokens.google) {
            return false
          }
          if (dbGuild.settings.enableNotifications === false) {
            return false
          }

          let connection = R.find(R.propEq('type', 'google#calendarId'), dbGuild.connections)

          if (!connection) {
            return false
          }

          let timeAdd = dbGuild.settings.timeBefore || 30

          let authClient = google.getAuthClient(dbGuild.tokens.google)

          return google.getCalendarUpcomingEvents(authClient, connection.value, {
            maxResults: 10,
            timeMax: moment().add(timeAdd, 'minutes').toISOString()
          }).then(events => {
            let eventIds = R.map(R.prop('id'), events)

            Promise.each(client.db.Event.find({
              guildId: guildId,
              eventId: {
                $in: eventIds
              }
            }).then(foundEvents => {
              return R.differenceWith((x, y) => {
                return x.id === y.eventId
              }, events, foundEvents)
            }), event => {
              let params = CalendarUtils.getParameters(event)

              if (!params) {
                return false
              }

              let erisGuild = client.guilds.get(guildId)

              let foundChannel = R.find(channel => {
                return (!!channel.name) &&
                channel.name.toLowerCase() === params.channel &&
                channel.type === 0
              }, erisGuild.channels)

              if (!foundChannel) {
                return false
              }

              let message = '**Hey, Listen!**'

              if (params.role) {
                let foundRole = R.find(role => {
                  return role.name.toLowerCase() === params.role &&
                  role.mentionable === true
                }, erisGuild.roles)

                if (foundRole) {
                  message = message + ' ' + foundRole.mention
                }
              }

              let dbEvent = new client.db.Event({
                guildId: guildId,
                eventId: params.eventId,
                channelId: foundChannel.id,
                sentAt: new Date(),
                endsAt: params.endDateTime
              })

              let embed = CalendarUtils.createEmbed(params)

              client.createMessage(foundChannel.id, {
                content: message,
                embed
              }).then(() => dbEvent.save())
            })
          })
        })
    })
  }
}

module.exports = HandleEventsTask
