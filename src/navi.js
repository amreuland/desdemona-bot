'use strict'

global.Promise = require('bluebird')

const chalk = require('chalk')
const path = require('path')
const winston = require('winston')
const moment = require('moment')
const util = require('util')

const { Mongoose, Sentry, GuildManager } = require('./lib')

const handleEvents = require('./lib/handleEvents')

const GCalAPI = require('./api/gcal')

const resolve = (str) => path.join('src', str)
const resolveConfig = (str) => path.join('..', 'config', str)

const config = require(resolveConfig('config'))
const {client_secret: googleClientSecret, client_id: googleClientId, redirect_uris: googleClientRedirects} = require(resolveConfig('client_secret')).installed

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

const navi = new Client({
  token: config.bot.token,
  modules: resolve('modules'),
  messageLimit: 0,
  maxShards: processShards * parseInt(process.env['PROCESS_COUNT'], 10),
  firstShardID,
  lastShardID,
  autoreconnect: true
})

navi
  .unregister('logger', 'console')
  .register('logger', 'winston', logger)

const raven = new Sentry(navi, config)

navi.on('commander:registered', ({ trigger, group, aliases } = {}) =>
  navi.logger.debug(`Command '${trigger}' in group '${group}' registered with ${aliases} aliases`)
)

navi
  .unregister('middleware', true)
  .register('middleware', resolve('middleware'))
  .register('commands', resolve('commands'), { groupedCommands: true })

navi.on('ready', () => {
  const guilds = navi.guilds.size
  const users = navi.users.size
  const channels = Object.keys(navi.channelGuildMap).length

  navi.logger.info(
    `G: ${chalk.green.bold(guilds)} | ` +
    `C: ${chalk.green.bold(channels)} | ` +
    `U: ${chalk.green.bold(users)}`
  )
  navi.logger.info(`Prefix: ${chalk.cyan.bold(navi.prefix)}`)
})

navi.on('shardReady', (id) =>
  navi.logger.info(`${chalk.red.bold(navi.user.username)} - ${`Shard ${id} is ready!`}`)
)

const guildManager = new GuildManager(navi)

navi.guildManager = guildManager

const GoogleCalendarAPI = new GCalAPI(googleClientId, googleClientSecret, googleClientRedirects)

navi.gcal = GoogleCalendarAPI

navi.on('shardDisconnect', (id) => navi.logger.info(chalk.red.bold(`Shard "${id}" has disconnected`)))

navi.on('shardResume', (id) => navi.logger.info(chalk.green.bold(`Shard "${id}" has resumed`)))

navi.on('error', err => raven.captureException(err))

navi.once('ready', () => {
  setInterval(handleEvents.bind(navi), (config.calendar.pollingRate || 20) * 1000)
})

Mongoose(config.mongo)
  .then(db => {
    navi.mongoose = db
    navi.models = db.models
    navi.run()
  })
