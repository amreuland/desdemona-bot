'use strict'

const chalk = require('chalk')

const { Module } = require('sylphy')

class ShardsModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'shard:logger',
      events: {
        shardReady: 'onShardReady',
        shardResume: 'onShardResume',
        shardDisconnect: 'onShardReady'
      }
    })
  }

  onShardReady (id) {
    this.logger.info(`${chalk.red.bold(this._client.user.username)} - ${`Shard ${id} is ready!`}`)
  }

  onShardResume (id) {
    this.logger.info(chalk.green.bold(`Shard ${id} has resumed`))
  }

  onShardDisconnect (id) {
    this.logger.info(chalk.red.bold(`Shard ${id} has disconnected`))
  }
}

module.exports = ShardsModule
