'use strict'

const { Command } = require.main.require('./sylphy')

class BanCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'ban',
      description: 'Ban a user after sending them a message',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'reason', displayName: 'reason', type: 'string', optional: true, last: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['banMembers']
      },
      examples: [
        {
          args: '@Apples Multiple Warnings',
          description: 'Ban the user Apples with the reason \'Multiple Warnings\''
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member[0]
    let reason = args.reason || 'No Reason Provided'

    return msg.delete('Hide moderation commands')
      .then(() => {
        return responder.selection(['Yes', 'No'], {
          title: `Are you sure you want to ban ${member.username}`
        })
          .then(response => {
            if (response[0] !== 'Yes') {
              return responder.success('Action canceled')
            }

            return client.services.Punish.ban(msg.member, member, reason)
              .then(() => responder.success('{{ban.SUCCESS}}', {
                deleteDelay: 5,
                member: member.mention
              }))
          })
      })
  }
}

module.exports = BanCommand
