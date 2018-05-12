'use strict'

const { Command } = require.main.require('./sylphy')

class PrefixCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'prefix',
      description: 'Set the prefix for the bot on this server.',
      usage: [{ name: 'prefix', displayName: 'prefix', type: 'string', optional: true }],
      examples: [
        { args: '!.', description: 'Set the bot prefix to \'!.\'' },
        { args: '', description: 'Clear the bot prefix' }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageGuild']
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    let prefix = args.prefix

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        if (!prefix) {
          delete dbGuild.settings.prefix
          dbGuild.markModified('settings')
          return dbGuild.save()
            .then(() => client.cache.guild.del(`${guildId}:prefix`))
            .then(() => responder.success('prefix removed!'))
        }

        dbGuild.settings.prefix = prefix
        dbGuild.markModified('settings')
        return dbGuild.save()
          .then(() => client.cache.guild.set(`${guildId}:prefix`, prefix, 'EX', 3600))
          .then(() => responder.success('prefix changed!'))
      })
      .then(() => {
        return client.cache.guild.del(`flag:${guildId}:prefix`)
      })
  }
}

module.exports = PrefixCommand
