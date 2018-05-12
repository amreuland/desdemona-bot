'use strict'

const { Command } = require.main.require('./sylphy')

class LockdownOverrideCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'lockdownoverride',
      aliases: ['lockdownrole'],
      description: 'Assign a role to bypass channel lockdown',
      usage: [
        { name: 'role', displayName: 'role', type: 'role', optional: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageMessages']
      },
      examples: [
        {
          args: '@Apples',
          description: 'Prevent Apples from sending messages indefinitely'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member[0]
    let time = args.timeout || 0

    let SilenceService = client.services.Silence

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

module.exports = false
