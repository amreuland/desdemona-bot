'use strict'

const R = require('ramda')
const moment = require('moment')

const descFunc = R.compose(R.join('\n'), R.difference)
const paramsFunc1 = R.filter(
  R.compose(
    R.test(/^\$[a-z]+: ?[A-Za-z0-9 :/.]+$/),
    R.trim
  )
)
const paramsFunc2 = R.compose(
  R.converge(
    R.zipObj, [
      R.compose(
        R.map(R.replace(/\$/, '')),
        R.prop(0)
      ),
      R.compose(
        R.map(R.toLower),
        R.prop(1)
      )
    ]
  ),
  R.transpose,
  R.map(R.split(': '))
)

function handleEvents () {
  let self = this

  let guildIds = R.keys(this.guildShardMap)

  return Promise.each(guildIds, guildId => {
    return self.guildManager.get(guildId)
      .tap(guild => guild.populateDBObj())
      .then(guild => {
        if (!guild.db.calendarId || !guild.db.authToken) {
          return false
        }
        if (guild.db.settings.enableNotifications === false) {
          return false
        }

        let timeAdd = guild.db.settings.timeBefore || 5

        return guild.getUpcomingEvents({
          maxResults: 10,
          timeMax: moment().add(timeAdd, 'minutes').toISOString()
        }).then(events => {
          let eventIds = R.map(R.prop('id'), events)

          Promise.each(self.models.Event.find({
            guild: guild.db._id,
            eventId: {
              $in: eventIds
            }
          }).then(foundEvents => {
            return R.differenceWith((x, y) => {
              return x.id === y.eventId
            }, events, foundEvents)
          }), event => {
            let lines = event.description.split('\n')

            let params = paramsFunc1(lines)

            let description = descFunc(lines, params)

            params = paramsFunc2(params)

            let foundChannel = R.find(channel => {
              return (!!channel.name) &&
              channel.name.toLowerCase() === params.channel &&
              channel.type === 0
            }, guild.erisObject.channels)

            if (!foundChannel) {
              return false
            }

            let message = ''

            if (params.role) {
              let foundRole = R.find(role => {
                return role.name.toLowerCase() === params.role &&
                role.mentionable === true
              }, guild.erisObject.roles)

              if (foundRole) {
                message = foundRole.mention
              }
            }

            let dbEvent = new self.models.Event({
              guild: guild.db._id,
              eventId: event.id,
              sentAt: new Date(),
              endsAt: moment(event.end.dateTime).toDate()
            })

            let url = params.url || event.htmlLink

            let title = `:calendar_spiral: Event Reminder - ${
              params.title || event.summary
            }`

            // let color = params.color || 0xdf3939

            self.createMessage(foundChannel.id, {
              content: message,
              embed: {
                title,
                url,
                description,
                color: 0xdf3939,
                timestamp: moment(event.start.dateTime).toDate(),
                provider: {
                  name: event.organizer.displayName
                }
              }
            }).then(() => dbEvent.save())
          })
        })
      })
  })
}

module.exports = handleEvents
