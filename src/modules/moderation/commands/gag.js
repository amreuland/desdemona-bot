'use strict'

const { Command } = require('sylphy')

const { SilenceService } = require('../services')

class GagCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'silence',
      aliases: ['gag'],
      description: 'Prevent a user from sending messages in the server',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'timeout', displayName: 'duration', type: 'int', optional: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageMessages', 'MuteMembers']
      },
      examples: [
        {
          args: '@Apples',
          description: 'Prevent Apples from sending messages indefinitely'
        },
        {
          args: '@Apples 600',
          description: 'Prevent Apples from sending messages for 10 minutes'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member[0]
    let time = args.timeout || 0

    return SilenceService.silence(client, member, time)
      .then(() => {
        if (time) {
          return responder.success('{{gag.SUCCESS_TIMEOUT}}', {
            time: time
          })
        }

        return responder.success('{{gag.SUCCESS}}')
      })
      .catch(SilenceService.silenceResults.ERROR_IS_BOT, () => {
        return responder.error('{{gag.errors.IS_BOT}}')
      })
      .catch(SilenceService.silenceResults.ERROR_ALREADY_SILENCED, () => {
        return responder.error('{{gag.errors.ALREADY_GAGGED}}')
      })
  }
}

module.exports = GagCommand
