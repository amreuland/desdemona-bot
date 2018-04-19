'use strict'

const chalk = require('chalk')

const { Module } = require('sylphy')

class StartupModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'navi:startup',
      events: {
        ready: 'onReady',
        error: 'onError'
      }
    })
  }

  onReady () {
    const guilds = this._client.guilds.size
    const users = this._client.users.size
    const channels = Object.keys(this._client.channelGuildMap).length

    this.logger.info(
      `G: ${chalk.green.bold(guilds)} | ` +
      `C: ${chalk.green.bold(channels)} | ` +
      `U: ${chalk.green.bold(users)}`
    )
    this.logger.info(`Prefix: ${chalk.cyan.bold(this._client.prefix)}`)
  }

  onError (err) {
    this._client.raven.captureException(err)
  }
}

module.exports = StartupModule
