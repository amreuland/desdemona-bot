'use strict'

const { Command } = require.main.require('./sylphy')

class PingCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'ping',
      description: 'Pong! Check bot latency to discord gateway',
      cooldown: 30
    })
  }

  async handle ({ msg, client }, responder) {
    let shard = msg.channel.guild.shard
    let latency = shard.latency

    return responder.format('emoji:stopwatch').send('{{ping.SUCCESS}}', { latency: latency })
  }
}

module.exports = PingCommand
