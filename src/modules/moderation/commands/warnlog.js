'use strict'

const R = require('ramda')

const { Command } = require.main.require('./sylphy')

const ModerationUtils = require('../util')

const warnsPP = 5

const sortFunc = (warnings, guildId) => R.compose(
  R.sortBy(R.prop('timestamp')),
  R.filter(R.propEq('guildId', guildId))
)(warnings)

const sortFunc2 = (warnings, guildId) => R.filter(
  R.both(
    R.compose(
      R.not,
      R.propEq('guildId', guildId)
    ),
    R.propEq('forgiven', false)
  )
)(warnings)

class WarnLogCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'warnlog',
      description: 'Lookup a users warning history',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' }
      ],
      options: {
        guildOnly: true,
        permissions: ['kickMembers'],
        hidden: false
      },
      examples: [
        {
          args: '@Apples',
          description: 'Retrieve the warning log for Apples'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let member = args.member[0]
    let userId = member.id

    if (member.bot) {
      return responder.error('{{warnlog.errors.IS_BOT}}')
    }

    return client.db.Warning.find({ userId })
      .then(dbWarns => {
        let guildWarningsCount = sortFunc(dbWarns, guildId).length

        if (!guildWarningsCount) {
          return responder.error('{{warnlog.errors.NO_HISTORY}}', {
            user: `${member.username}#${member.discriminator}`
          })
        }

        let otherWarningsCount = sortFunc2(dbWarns, guildId).length

        return responder.paginate({
          currentPage: 0,
          total: guildWarningsCount,
          ipp: warnsPP,
          func: page => {
            return client.db.Warning.find({ userId, guildId })
              .sort({ timestamp: 'asc' })
              .skip(page * warnsPP)
              .limit(warnsPP)
              .then(dbWarns2 => {
                let embed = ModerationUtils.createWarnlogEmbed(page, warnsPP,
                  member, dbWarns2,
                  guildWarningsCount, otherWarningsCount)
                return { embed }
              })
          }
        })
      })
  }
}

module.exports = WarnLogCommand
