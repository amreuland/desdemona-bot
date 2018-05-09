'use strict'

const DiscordRESTError = require('eris/lib/errors/DiscordRESTError')

const { Command } = require('sylphy')

class IAmCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'iam',
      description: 'Add a self assignable role to yourself',
      usage: [{ name: 'role', displayName: 'role', type: 'role' }],
      examples: [
        {
          args: 'Radioactive',
          description: 'add the Radioactive role to yourself'
        }
      ],
      cooldown: 5,
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

    if (member.roles.includes(roleId)) {
      return responder.error('{{iam.errors.ALREADY_APPLIED}}', {
        role: role.name
      })
    }

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        if (!dbGuild.selfroles.includes(roleId)) {
          return responder.error('{{iam.errors.NOT_IN_LIST}}', {
            role: role.name
          })
        }

        return member.addRole(roleId, 'Self Roles Add')
          .then(() => responder.success('{{iam.SUCCESS}}', {
            role: role.name
          }))
          .catch(DiscordRESTError, () => responder.error('{{iamnot.errors.ROLE_ABOVE_BOT}}', {
            role: role.name
          }))
      })
  }
}

module.exports = IAmCommand
