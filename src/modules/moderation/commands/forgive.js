'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const sortFunc = (warnings, guildId) => R.compose(
  R.sortBy(R.prop('timestamp')),
  R.filter(R.propEq('guildId', guildId))
)(warnings)

class ForgiveCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'forgive',
      description: 'Forgive a users warning',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'warnNumber', displayName: 'number', type: 'int' }
      ],
      options: {
        guildOnly: true,
        permissions: ['kickMembers'],
        hidden: false
      },
      examples: [
        { args: '@Apples 3', description: 'forgive Apples for their 3rd warning' }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let member = args.member[0]
    let userId = member.id
    let warnNumber = args.warnNumber - 1

    if (member.bot) {
      return responder.error('{{forgive.errors.IS_BOT}}')
    }

    return client.db.User.findOne({ userId })
      .populate('warnings')
      .then(dbUser => {
        if (!dbUser) {
          return responder.error('{{forgive.errors.USER_NOT_FOUND}}')
        }

        let guildWarnings = sortFunc(dbUser.warnings, guildId)
        let warning = guildWarnings[warnNumber]

        if (!warning) {
          return responder.error('{{forgive.errors.WARN_NOT_EXIST}}')
        }

        if (warning.forgiven) {
          return responder.error('{{forgive.errors.ALREADY_FORGIVEN}}')
        }

        warning.forgiven = true
        return warning.save()
          .then(() => responder.success('{{forgive.SUCCESS}}', {
            user: member.mention,
            reason: warning.reason
          }))
      })
  }
}

module.exports = ForgiveCommand
