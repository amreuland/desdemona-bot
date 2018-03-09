'use strict'

const { Command } = require('sylphy')

class AddGame extends Command {
  constructor (...args) {
    super(...args, {
      name: 'add',
      group: 'game',
      description: 'Add a game to the server list',
      options: {
        guildOnly: true,
        hidden: false
      }
    })
  }

  async handle ({ msg }, responder) {
    return responder.format('code:text').send(JSON.stringify(msg, null, 2))
  }
}

module.exports = AddGame
