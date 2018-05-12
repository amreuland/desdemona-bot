'use strict'

const { Command } = require.main.require('./sylphy')

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
        permissions: ['kickMembers']
      },
      examples: [
        { args: '@Apples 3', description: 'forgive Apples for their 3rd warning' }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member[0]
    let num = args.warnNumber

    let PunishService = client.services.Punish

    return PunishService.forgive(client, msg.member, member, num)
      .then((code, { reason }) => responder.success('{{forgive.SUCCESS}}', {
        user: member.mention,
        reason
      }))
      .catch(PunishService.forgiveResults.ERROR_IS_BOT, () => {
        return responder.error('{{forgive.errors.IS_BOT}}')
      })
      .catch(PunishService.forgiveResults.ERROR_WARN_NOT_EXIST, () => {
        return responder.error('{{forgive.errors.WARN_NOT_EXIST}}')
      })
      .catch(PunishService.forgiveResults.ERROR_ALREADY_FORGIVEN, () => {
        return responder.error('{{forgive.errors.ALREADY_FORGIVEN}}')
      })
  }
}

module.exports = ForgiveCommand
