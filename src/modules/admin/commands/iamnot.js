'use strict'

const { Command } = require('sylphy')

class IAmNotCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'iamnot',
      description: 'Remove a self assignable role from yourself',
      usage: [{
        name: 'role',
        displayName: 'role',
        type: 'role'
      }],
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

  }
}

module.exports = IAmNotCommand
