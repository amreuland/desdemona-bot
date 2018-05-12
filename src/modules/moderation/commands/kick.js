'use strict'

const { Command } = require.main.require('./sylphy')

const { PunishService } = require('../services')

class KickCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'kick',
      description: 'Kick a user after sending them a message',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'reason', displayName: 'reason', type: 'string', optional: true, last: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['kickMembers']
      },
      examples: [
        {
          args: '@Apples Multiple Warnings',
          description: 'Kick the user Apples with the reason \'Multiple Warnings\''
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member[0]
    let reason = args.reason || 'No Reason Provided'

    return msg.delete('Hide moderation commands')
      .then(() => {
        return responder.selection(['Yes', 'No'], `Are you sure you want to kick ${member.username}`)
          .then(response => {
            if (response[0] !== 'Yes') {
              return responder.success('Action canceled')
            }

            return PunishService.kick(client, msg.member, member, reason)
              .then(() => responder.success('{{kick.SUCCESS}}', {
                deleteDelay: 5,
                member: member.mention
              }))
          })
      })
  }
}

module.exports = KickCommand
