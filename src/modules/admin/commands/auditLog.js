'use strict'

const { Command } = require.main.require('./sylphy')

class AuditLogCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'auditlog',
      description: 'Set an audit channel for the bot to report to',
      usage: [{
        name: 'channel',
        displayName: 'channel',
        type: 'channel',
        optional: true
      }],
      options: {
        guildOnly: true,
        permissions: [
          'administrator'
        ],
        hidden: false
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id
    let channel = args.channel[0] || null

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        dbGuild.channels.audit = channel.id
        dbGuild.markModified('channels')
        return dbGuild.save()
      })
      .then(() => responder.success('the audit log channel has been set!'))
  }
}

module.exports = AuditLogCommand
