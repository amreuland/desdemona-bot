'use strict'

const { Command } = require.main.require('./sylphy')

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
    let role = args.role[0]
    let member = msg.member

    let SARService = client.services.SelfAssignedRoles

    return SARService.assign(client, member, role)
      .then(() => {
        return responder.success('{{iam.SUCCESS}}', {
          role: role.name
        })
      })
      .catch(SARService.assignResults.ERROR_NOT_ASSIGNABLE, () => {
        return responder.error('{{iam.errors.NOT_IN_LIST}}', {
          role: role.name
        })
      })
      .catch(SARService.assignResults.ERROR_ALREADY_HAVE, () => {
        return responder.error('{{iam.errors.ALREADY_APPLIED}}', {
          role: role.name
        })
      })
      .catch(SARService.assignResults.ERROR_NO_PERMS, () => {
        return responder.error('{{iamnot.errors.ROLE_ABOVE_BOT}}', {
          role: role.name
        })
      })
  }
}

module.exports = IAmCommand
