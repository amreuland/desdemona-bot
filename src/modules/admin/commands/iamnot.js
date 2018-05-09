'use strict'

const DiscordRESTError = require('eris/lib/errors/DiscordRESTError')

const { Command } = require('sylphy')

class IAmNotCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'iamnot',
      description: 'Remove a self assignable role from yourself',
      usage: [{ name: 'role', displayName: 'role', type: 'role' }],
      examples: [
        {
          args: 'Radioactive',
          description: 'remove the Radioactive role from yourself'
        }
      ],
      options: {
        guildOnly: true
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let role = args.role[0]
    let roleId = role.id
    let member = msg.member

    if (!member.roles.includes(roleId)) {
      return responder.error('{{iamnot.errors.NOT_APPLIED}}', {
        role: role.name
      })
    }

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        if (!dbGuild.selfroles.includes(roleId)) {
          return responder.error('{{iamnot.errors.NOT_IN_LIST}}', {
            role: role.name
          })
        }

        return member.removeRole(roleId, 'Self Roles Remove')
          .then(() => responder.success('{{iamnot.SUCCESS}}', {
            role: role.name
          }))
          .catch(DiscordRESTError, () => responder.error('{{iamnot.errors.ROLE_ABOVE_BOT}}', {
            role: role.name
          }))
      })
  }
}

module.exports = IAmNotCommand
