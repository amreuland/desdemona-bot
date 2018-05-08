'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const ModerationUtils = require('../util')

class KickCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'kick',
      description: 'Kick a user after sending them a message',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'reason', displayName: 'reason', type: 'string', optional: true, last: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['kickMembers']
      },
      examples: [
        {
          args: '@Apples Multiple Warnings',
          description: 'Kick the user Apples with the reason \'Multiple Warnings\''
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let member = args.member[0]
    let userId = member.id
    let reason = args.reason || 'No Reason Provided'


    return msg.delete('Hide moderation commands')
      .then(() => {
        return responder.selection(['Yes', 'No'], `Are you sure you want to kick ${member.mention}`)
          .then(response => {
            if (response[0] !== 'Yes') {
              return Promise.reject(new ActionCanceledException())
            }
          })
      })
      .then(() => client.db.User.findOneOrCreate({ userId }, { userId }))
      .then(dbUser => {
        return client.db.Warning.create({
          user: dbUser._id,
          userId,
          guildId,
          reason: `**USER KICKED**\n${reason}`,
          timestamp: new Date(),
          moderatorId: msg.author.id
        })
      })
      .then(() => member.user.getDMChannel())
      .then(dmChannel => {
        let embed = ModerationUtils.createKickMsgEmbed(guild, reason)
        return dmChannel.createMessage({ embed })
      })
      .then(() => {
        return member.kick(reason)
      })
      .then(() => {
        return responder.success('{{kick.SUCCESS}}', {
          deleteDelay: 5,
          member: member.mention
        })
      })
  }
}

module.exports = KickCommand
