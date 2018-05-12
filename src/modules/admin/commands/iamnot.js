'use strict'

const { Command } = require.main.require('./sylphy')

const { SelfAssignedRolesService: SARService } = require('../services')

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
    let role = args.role[0]
    let member = msg.member

    return SARService.unassign(client, member, role)
      .then(() => {
        return responder.success('{{iamnot.SUCCESS}}', {
          role: role.name
        })
      })
      .catch(SARService.unassignResults.ERROR_NOT_ASSIGNABLE, () => {
        return responder.error('{{iamnot.errors.NOT_IN_LIST}}', {
          role: role.name
        })
      })
      .catch(SARService.unassignResults.ERROR_NOT_HAVE, () => {
        return responder.error('{{iamnot.errors.NOT_APPLIED}}', {
          role: role.name
        })
      })
      .catch(SARService.unassignResults.ERROR_NO_PERMS, () => {
        return responder.error('{{iamnot.errors.ROLE_ABOVE_BOT}}', {
          role: role.name
        })
      })
  }
}

module.exports = IAmNotCommand
