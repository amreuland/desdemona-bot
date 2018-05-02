'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const { ModerationUtils } = require('../../util')

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
      group: 'moderation',
      description: 'Lookup a users warning hisotry',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' }
      ],
      options: {
        guildOnly: true,
        permissions: ['kickMembers'],
        hidden: false
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let member = args.member[0]
    let userId = member.id

    return client.db.User.findOne({ userId })
      .populate('warnings')
      .then(dbUser => {
        if (!dbUser || !dbUser.warnings.length) {
          return responder.error('{{warnlog.errors.NO_HISTORY}}', {user: `${member.username}#${member.discriminator}`})
        }

        let guildWarnings = sortFunc(dbUser.warnings, guildId)

        let otherWarningsCount = sortFunc2(dbUser.warnings, guildId).length

        let embed = ModerationUtils.createWarnlogEmbed(member, guildWarnings, otherWarningsCount)

        msg.channel.createMessage({ embed })
      })
      .catch(err => client.raven.captureException(err))
  }
}

module.exports = WarnLogCommand
