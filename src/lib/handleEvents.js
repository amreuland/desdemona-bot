'use strict'

const R = require('ramda')
const moment = require('moment')
const Promise = require('bluebird')

const descFunc = R.compose(R.join('\n'), R.difference)
const paramsFunc1 = R.filter(
  R.compose(
    R.test(/^\$[a-z]+: [A-Za-z0-9]+$/),
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

async function handleEvents () {
  let self = this

  let guildIds = R.keys(this.guildShardMap)

  let guildCalendarMapping = {}

  let items = await this.models.Guild.find({
    guildId: {
      $in: guildIds
    }
  })

  let itemsFiltered = R.filter(R.hasIn('calendarId'), items)

  R.forEach(item => {
    guildCalendarMapping[item.guildId] = item.calendarId
  }, itemsFiltered)

  let nowPlusFive = moment().add(5, 'minutes').toISOString()

  return Promise.each(guildIds, guildId => {
    return self.guildManager.get(guildId)
      .then(guild => {
        return guild.getUpcomingEvents({
          maxResults: 5,
          timeMax: nowPlusFive
        }).then(events => ({guild, events}))
      }).then(({guild, events}) => {
        let eventIds = R.map(R.prop('id'), events)
        let erisGuild = guild.getErisObject()

        Promise.each(self.models.Event.find({
          guildId: guild.getGuildId(),
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

          let desc = descFunc(lines, params)

          params = paramsFunc2(params)

          let foundChannel = R.find(channel => {
            return (!!channel.name) &&
            channel.name.toLowerCase() === params['channel'] &&
            channel.type === 0
          }, erisGuild.channels)

          let message = ''

          if (params['role']) {
            let foundRole = R.find(role => {
              return role.name.toLowerCase() === params['role'] &&
              role.mentionable === true
            }, erisGuild.roles)

            if (foundRole) {
              message = foundRole.mention
            }
          }

          let dbEvent = new self.models.Event({
            guildId: guild.getGuildId(),
            eventId: event.id,
            sentAt: new Date()
          })

          dbEvent.save()

          self.createMessage(foundChannel.id, {
            content: message,
            embed: {
              title: ':calendar_spiral: Event Reminder!',
              color: 0xdf3939,
              description: desc,
              url: event.htmlLink,
              timestamp: moment(event.start.dateTime).toDate(),
              provider: {
                name: event.organizer.displayName
              }
            }
          })
        })
      })
  })
}

module.exports = handleEvents
