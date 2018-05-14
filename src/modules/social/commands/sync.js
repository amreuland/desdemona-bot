'use strict'

const { Command } = require.main.require('./sylphy')

class SyncStatsCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'syncstats',
      description: 'Sync stats from different bots',
      usage: [{
        name: 'subcmd',
        displayName: 'bot',
        type: 'string',
        choices: ['tatsumaki']
      }],
      subcommands: {
        tatsumaki: {
          name: 'tatsumaki'
        }
      }
    })
  }

  async handle ({ msg, client, args }, responder) {}

  async tatsumaki ({ msg, client }, responder) {
    let response = await responder.selection(['Yes', 'No'], {
      title: '{{syncstats.warnings.TATS}}'
    })
    if (response[0] !== 'Yes') {
      return
    }

    let userId = msg.author.id
    return client.api.tatsumaki.user(userId)
      .then(tatsUser => client.db.User.findOneOrCreate({ userId }, { userId })
        .then(dbUser => {
          dbUser.title = tatsUser.title
          dbUser.info = tatsUser.info
          dbUser.reputation = tatsUser.reputation
          dbUser.money = tatsUser.credits
          dbUser.globalXp = tatsUser.totalxp
          return dbUser.save()
        })
        .then(dbUser => {
          return responder.success('{{syncstats.success.TATS}}', {
            xp: dbUser.globalXp,
            money: dbUser.money,
            rep: dbUser.reputation
          })
        })
      )
  }
}

module.exports = SyncStatsCommand
