'use strict'

const { Command } = require('sylphy')

class SteamLookupCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'steam',
      group: 'util',
      description: 'Lookup a users profile',
      usage: [{
        name: 'member',
        displayName: 'user',
        type: 'member'
      }],
      cooldown: 30,
      options: {
        guildOnly: true,
        hidden: false
      }
    })
  }

  async handle ({ msg, client }, responder) {

  }
}

module.exports = SteamLookupCommand
