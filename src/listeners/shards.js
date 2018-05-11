'use strict'

const chalk = require('chalk')

const { Listener } = require('../sylphy')

class ShardsListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'shard:logger',
      events: {
        shardReady: 'onShardReady',
        shardResume: 'onShardResume',
        shardDisconnect: 'onShardDisconnect'
      }
    })
  }

  onShardReady (id) {
    this.logger.info(`${chalk.red.bold(this._client.user.username)} - ${`Shard ${id} is ready!`}`)
  }

  onShardResume (id) {
    this.logger.info(chalk.green.bold(`Shard ${id} has resumed`))
  }

  onShardDisconnect (err, id) {
    this.logger.warn(chalk.red.bold(`Shard ${id} has disconnected`))
    if (err) {
      this.logger.warn(chalk.red.bold(err))
    }
  }
}

module.exports = ShardsListener
