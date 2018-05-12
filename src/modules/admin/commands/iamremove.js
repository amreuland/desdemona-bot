'use strict'

const { Command } = require.main.require('./sylphy')

const { SelfAssignedRolesService: SARService } = require('../services')

class IAmRemoveCommand extends Command {
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
    let role = args.role[0]

    return SARService.remove(client, role)
      .then(() => {
        return responder.success('{{iamrem.SUCCESS}}', {
          role: role.name
        })
      })
      .catch(SARService.removeResults.ERROR_NOT_EXIST, () => {
        return responder.error('{{iamrem.ERROR}}', {
          role: role.name
        })
      })
  }
}

module.exports = IAmRemoveCommand
