'use strict'

const { Command } = require.main.require('./sylphy')

class UnGagCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'unsilence',
      aliases: ['ungag'],
      description: 'Un-Silence a user',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageMessages']
      },
      examples: [
        { args: '@Apples', description: 'Un-Silence Apples' }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member[0]

    let SilenceService = client.services.Silence

    return SilenceService.unsilence(member)
      .then(() => responder.success('{{ungag.SUCCESS}}', {
        member: member.username
      }))
      .catch(SilenceService.unsilenceResults.ERROR_IS_BOT, () => {
        return responder.error('{{ungag.errors.IS_BOT}}')
      })
      .catch(SilenceService.unsilenceResults.ERROR_NOT_SILENCED, () => {
        return responder.error('{{ungag.errors.NOT_GAGGED}}')
      })
  }
}

module.exports = UnGagCommand
