'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const { ModerationUtils } = require('../../util')

class WarnCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'warn',
      group: 'moderation',
      description: 'Warn a user',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'reason', displayName: 'reason', type: 'string', last: true }
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
    let reason = args.reason

    return msg.delete('Hide moderation commands')
      .then(() => client.db.User.findOne({ userId }).populate('warnings'))
      .then(dbUser => {
        if (!dbUser) {
          return client.db.User.create({ userId })
        }

        return dbUser
      })
      .then(dbUser => {
        return client.db.Warning.create({
          user: dbUser._id,
          userId,
          guildId,
          reason,
          timestamp: new Date(),
          moderatorId: msg.author.id
        })
          .then(() => member.user.getDMChannel())
          .then(pmChannel => {
            let guildWarnings = R.filter(
              R.propEq('guildId', guildId), dbUser.warnings || [])

            let unforgivenWarnings = R.filter(R.propEq('forgiven', false), guildWarnings)

            let warnCount = guildWarnings.length + 1
            let embed = ModerationUtils.createWarningEmbed(
              guild, msg.member, unforgivenWarnings.length, reason)

            return pmChannel.createMessage({ embed })
              .then(() => responder.success('{{%warn.SUCCESS}}', {
                user: member.mention,
                count: warnCount,
                unforgiven: unforgivenWarnings
              }))
          })
      })
      .catch(err => client.raven.captureException(err))
  }
}

module.exports = WarnCommand
