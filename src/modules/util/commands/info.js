'use strict'

const { Command } = require.main.require('./sylphy')

const { UtilityUtils } = require('../util')

class InfoCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'info',
      aliases: ['userinfo'],
      description: 'Show info about a user',
      usage: [{ name: 'member', displayName: 'member', type: 'member', optional: true }],
      examples: [
        { args: '', description: 'Show info about yourself' },
        { args: '@someone', description: 'Show info about @someone' }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageGuild']
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = (args.member && args.member[0]) ? args.member[0] : msg.member

    let embed = UtilityUtils.createUserInfoEmbed(member)

    return responder.embed(embed).send()
  }
}

module.exports = InfoCommand
