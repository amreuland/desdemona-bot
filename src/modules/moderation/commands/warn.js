'use strict'

const { Command } = require('sylphy')

const { PunishService } = require('../services')

class WarnCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'warn',
      description: 'Warn a user',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'reason', displayName: 'reason', type: 'string', last: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['kickMembers']
      },
      examples: [
        {
          args: '@Apples Bad Language',
          description: 'warn Apples for Bad Language'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member[0]
    let reason = args.reason

    return PunishService.warn(client, msg.member, member, reason)
      .then(({ count, unforgiven }) => responder.success('{{warn.SUCCESS}}', {
        user: member.mention,
        count,
        unforgiven
      }))
      .catch(PunishService.warnResults.ERROR_IS_BOT, () => {
        return responder.error('{{warn.errors.IS_BOT}}')
      })
  }
}

module.exports = WarnCommand
