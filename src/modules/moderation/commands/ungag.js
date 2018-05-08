'use strict'

const { Command } = require('sylphy')

class UnGagCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'unsilence',
      aliases: ['ungag'],
      description: 'Un-Silence a user',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageMessages']
      },
      examples: [
        {
          args: '@Apples',
          description: 'Un-Silence Apples'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let member = args.member[0]
    let userId = member.id

    if (member.bot) {
      return responder.error('{{ungag.errors.IS_BOT}}')
    }

    return client.cache.mod.del(`gags:${guildId}:${userId}`)
      .then(() => client.db.Gag.findOne({ guildId, userId }))
      .then(dbGag => {
        if (!dbGag) {
          return responder.error('{{ungag.errors.NOT_GAGGED}}')
        }

        return dbGag.remove()
          .then(() => responder.success('{{ungag.SUCCESS}}'))
      })
  }
}

module.exports = UnGagCommand
