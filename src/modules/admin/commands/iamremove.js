'use strict'

const R = require('ramda')

const { Command } = require.main.require('./sylphy')

class IAmAddCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'iamrem',
      aliases: ['iamremove'],
      description: 'Remove a Self-Assignable role',
      usage: [{ name: 'role', displayName: 'role', type: 'role' }],
      examples: [
        {
          args: 'Radioactive',
          description: 'remove the Radioactive role from the list of self-assignable roles'
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
        if (!dbGuild.selfroles.includes(roleId)) {
          return responder.error('{{iamrem.ERROR}}', {
            role: role.name
          })
        }

        let newSelfroles = R.difference(dbGuild.selfroles, [roleId])
        dbGuild.selfroles = newSelfroles
        return dbGuild.save()
          .then(() => responder.success('{{iamrem.SUCCESS}}', {
            role: role.name
          }))
      })
  }
}

module.exports = IAmAddCommand
