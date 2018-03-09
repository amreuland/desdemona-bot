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

const desdemona = new Client({
  token: config.bot.token,
  modules: resolve('modules'),
  messageLimit: 0,
  maxShards: processShards * parseInt(process.env['PROCESS_COUNT'], 10),
  firstShardID,
  lastShardID,
  autoreconnect: true
})

desdemona
  .unregister('logger', 'console')
  .register('logger', 'winston', logger)

const raven = new Sentry(desdemona, config)

desdemona.on('commander:registered', ({ trigger, group, aliases } = {}) =>
  desdemona.logger.debug(`Command '${trigger}' in group '${group}' registered with ${aliases} aliases`)
)

desdemona
  .unregister('middleware', true)
  .register('middleware', resolve('middleware'))
  .register('commands', resolve('commands'), { groupedCommands: true })

desdemona.on('ready', () => {
  const guilds = desdemona.guilds.size
  const users = desdemona.users.size
  const channels = Object.keys(desdemona.channelGuildMap).length

  desdemona.logger.info(
    `G: ${chalk.green.bold(guilds)} | ` +
    `C: ${chalk.green.bold(channels)} | ` +
    `U: ${chalk.green.bold(users)}`
  )
  desdemona.logger.info(`Prefix: ${chalk.cyan.bold(desdemona.prefix)}`)
})

desdemona.on('shardReady', (id) =>
  desdemona.logger.info(`${chalk.red.bold(desdemona.user.username)} - ${`Shard ${id} is ready!`}`)
)

desdemona.on('shardDisconnect', (id) => desdemona.logger.info(chalk.red.bold(`Shard "${id}" has disconnected`)))

desdemona.on('shardResume', (id) => desdemona.logger.info(chalk.green.bold(`Shard "${id}" has resumed`)))

desdemona.on('error', err => raven.captureException(err))

desdemona.run()
