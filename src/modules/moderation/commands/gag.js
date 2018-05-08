'use strict'

const moment = require('moment')

const { Command } = require('sylphy')

class GagCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'silence',
      aliases: ['gag'],
      description: 'Prevent a user from sending messages in the server',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'timeout', displayName: 'duration', type: 'int', optional: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['manageMessages']
      },
      examples: [
        {
          args: '@Apples',
          description: 'Prevent Apples from sending messages indefinitely'
        },
        {
          args: '@Apples 600',
          description: 'Prevent Apples from sending messages for 10 minutes'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let member = args.member[0]
    let userId = member.id

    let timeout = args.timeout ? moment().add(args.timeout, 's').toDate() : 0

    if (member.bot) {
      return responder.error('{{gag.errors.IS_BOT}}')
    }

    return Promise.all([
      client.db.User.findOneOrCreate({ userId }, { userId }),
      client.db.Guild.findOneOrCreate({ guildId }, { guildId }),
      client.db.Gag.findOne({ guildId, userId })
    ])
      .then(([dbUser, dbGuild, dbGag]) => {
        if (!dbGag) {
          return client.db.Gag.create({
            user: dbUser._id,
            guild: dbGuild._id,
            userId,
            guildId,
            timeout
          }).then(() => {
            if (timeout) {
              return responder.success('{{gag.SUCCESS_TIMEOUT}}', {
                time: args.timeout
              })
            }
            return responder.success('{{gag.SUCCESS}}')
          })
        }

        return responder.error('{{gag.errors.ALREADY_GAGGED}}')
      })
  }
}

module.exports = GagCommand
