'use strict'

const { Command } = require('sylphy')

class PrefixCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'prefix',
      description: 'Set the prefix for the bot on this server',
      usage: [{
        name: 'prefix',
        displayName: 'prefix',
        type: 'string'
      }],
      options: {
        guildOnly: true,
        permissions: [
          'administrator'
        ]
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    return client.db.Guild.findOne({ guildId })
      .then(dbGuild => {
        if (!dbGuild) {
          return client.db.Guild.create({ guildId })
        }

        return dbGuild
      })
      .then(dbGuild => {
        dbGuild.channels.audit = args.channel[0].id
        dbGuild.markModified('settings')
        return dbGuild.save()
      })
      .then(() => responder.success('the audit log channel has been set!'))
  }
}

module.exports = PrefixCommand
