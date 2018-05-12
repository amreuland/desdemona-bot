'use strict'

const { Command } = require.main.require('./sylphy')

class LockdownCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'lockdown',
      aliases: ['lockdn'],
      description: 'Toggle lock on the current channel so only admins can speak',
      usage: [
        { name: 'time', displayName: 'time', type: 'int', optional: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageMessages']
      },
      examples: [
        {
          args: '',
          description: 'Lock/Unlock the current channel with no timeout'
        },
        {
          args: '300',
          description: 'Lock the current channel for 5 minutes'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let channel = msg.channel
    let time = args.timeout || 0

    let SilenceService = client.services.Silence

    return SilenceService.lockChannel(channel, time)
      .then(() => {
        if (time) {
          return responder.success('{{lockdown.SUCCESS_TIMEOUT}}', { time: time })
        }
        return responder.success('{{lockdown.SUCCESS}}')
      })
      .catch(SilenceService.lockResults.ERROR_ALREADY_LOCKED, () => {
        return SilenceService.unlockChannel(channel)
          .then(() => responder.success('{{unlockdown.SUCCESS}}'))
          .catch(SilenceService.unlockResults.ERROR_NOT_LOCKED, () => {
            return responder.error('{{unlockdown.ERROR}}')
          })
      })
  }
}

module.exports = LockdownCommand
