'use strict'

const chalk = require('chalk')
const path = require('path')
const winston = require('winston')
const moment = require('moment')
const util = require('util')

const Sentry = require('./lib/sentry')

const resolve = (str) => path.join('src', str)
const resolveConfig = (str) => path.join('..', 'config', str)

const config = require(resolveConfig('config'))

const { Client } = require('sylphy')

const processID = parseInt(process.env['PROCESS_ID'], 10)
const processShards = parseInt(process.env['SHARDS_PER_PROCESS'], 10)
const firstShardID = processID * processShards
const lastShardID = firstShardID + processShards - 1

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'silly',
      colorize: true,
      label: processShards > 1 ? `C ${firstShardID}-${lastShardID}` : `C ${processID}`,
      timestamp: () => `[${chalk.grey(moment().format('HH:mm:ss'))}]`
    })
  ]
})

const bot = new Client({
  token: config.bot.token,
  modules: resolve('modules'),
  messageLimit: 0,
  maxShards: processShards * parseInt(process.env['PROCESS_COUNT'], 10),
  firstShardID,
  lastShardID
})

bot
  .unregister('logger', 'console')
  .register('logger', 'winston', logger)

const raven = new Sentry(bot, config)

bot.on('commander:registered', ({ trigger, group, aliases } = {}) =>
  bot.logger.debug(`Command '${trigger}' in group '${group}' registered with ${aliases} aliases`)
)

bot
  // .unregister('middleware', true)
  .register('middleware', resolve('middleware'))
  .register('commands', resolve('commands'), { groupedCommands: true })

bot.on('ready', () => {
  const guilds = bot.guilds.size
  const users = bot.users.size
  const channels = Object.keys(bot.channelGuildMap).length

  bot.logger.info(`${chalk.red.bold(bot.user.username)} - ${
    firstShardID === lastShardID
      ? `Shard ${firstShardID} is ready!`
      : `Shards ${firstShardID} to ${lastShardID} are ready!`
  }`)
  bot.logger.info(
    `G: ${chalk.green.bold(guilds)} | ` +
    `C: ${chalk.green.bold(channels)} | ` +
    `U: ${chalk.green.bold(users)}`
  )
  bot.logger.info(`Prefix: ${chalk.cyan.bold(bot.prefix)}`)
})

bot.on('error', err => raven.captureException(err))

bot.run()
