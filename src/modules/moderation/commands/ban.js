'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const { ActionCanceledException } = require('../errors')

const ModerationUtils = require('../util')

class BanCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'ban',
      description: 'Ban a user after sending them a message',
      usage: [
        { name: 'member', displayName: 'member', type: 'member' },
        { name: 'reason', displayName: 'reason', type: 'string', optional: true, last: true }
      ],
      options: {
        guildOnly: true,
        permissions: ['banMembers']
      },
      examples: [
        {
          args: '@Apples Multiple Warnings',
          description: 'Ban the user Apples with the reason \'Multiple Warnings\''
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
        return responder.selection(['Yes', 'No'], `Are you sure you want to ban ${member.mention}`)
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
          reason: `**USER BANNED**\n${reason}`,
          timestamp: new Date(),
          moderatorId: msg.author.id
        })
      })
      .then(() => member.user.getDMChannel())
      .then(dmChannel => {
        let embed = ModerationUtils.createBanMsgEmbed(guild, reason)
        return dmChannel.createMessage({ embed })
      })
      .then(() => {
        return member.ban(0, reason)
      })
      .then(() => {
        return responder.success('{{ban.SUCCESS}}', {
          deleteDelay: 5,
          member: member.mention
        })
      })
      .catch(ActionCanceledException, () => {
        return responder.success('Action canceled')
      })
  }
}

module.exports = BanCommand
