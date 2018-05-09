'use strict'

const { Command } = require('sylphy')

class IAmAddCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'iamadd',
      description: 'Add a Self-Assignable role',
      usage: [{ name: 'role', displayName: 'role', type: 'role' }],
      examples: [
        {
          args: 'Radioactive',
          description: 'add the Radioactive role to the list of self-assignable roles'
        }
      ],
      options: {
        guildOnly: true,
        premissions: ['manageRoles']
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let role = args.role[0]
    let roleId = role.id

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        if (dbGuild.selfroles.includes(roleId)) {
          return responder.error('{{iamadd.ERROR}}', {
            role: role.name
          })
        }

        dbGuild.selfroles.push(roleId)
        return dbGuild.save()
          .then(() => responder.success('{{iamadd.SUCCESS}}', {
            role: role.name
          }))
      })
  }
}

module.exports = IAmAddCommand
