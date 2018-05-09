'use strict'

const { Command } = require('sylphy')

class IAmCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'iam',
      description: 'Add a self assignable role to yourself',
      usage: [{
        name: 'role',
        displayName: 'role',
        type: 'role'
      }],
      examples: [
        {
          args: 'Radioactive',
          description: 'add the Radioactive role to yourself'
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

module.exports = IAmCommand
