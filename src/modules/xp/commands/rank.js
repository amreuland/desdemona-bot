'use strict'

const { Command } = require.main.require('./sylphy')

class RankCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'rank',
      description: 'Get your rank - global and server',
      usage: [{ name: 'member', displayName: 'member', type: 'member', optional: true }],
      options: {
        guildOnly: true
      },
      cooldown: 45
    })
  }

  async handle ({ msg, client, args }, responder) {
    let member = args.member && args.member[0] ? args.member[0] : msg.member

    return client.services.Xp.getMemberStats(member)
      .then(userStats => client.services.Drawing.drawUserRankCard(member, userStats))
      .then(cardBuffer => responder.file('rank.png', cardBuffer).send())
  }
}

module.exports = RankCommand
