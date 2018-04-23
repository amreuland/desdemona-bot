'use strict'

global.Promise = require('bluebird')

const chalk = require('chalk')
const path = require('path')
const winston = require('winston')
const moment = require('moment')

const { Mongoose, Sentry, GuildManager } = require('./lib')

const { APIPlugin } = require('./plugins')

const handleEvents = require('./lib/handleEvents')

const { GoogleAuthAPI } = require('./api')

const { Client } = require('sylphy')

const resolve = (str) => path.join('src', str)
const resolveConfig = (str) => path.join('..', 'config', str)

class Navi extends Client {
  constructor (options = {}) {
    let processID = parseInt(process.env['PROCESS_ID'], 10)
    let processShards = parseInt(process.env['SHARDS_PER_PROCESS'], 10)
    let firstShardID = processID * processShards
    let lastShardID = firstShardID + processShards - 1

    options.maxShards = processShards * parseInt(process.env['PROCESS_COUNT'], 10)
    options.firstShardID = firstShardID
    options.lastShardID = lastShardID

    // options.noDefaults = true

    super(options)

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

    this
      .unregister('logger', 'console')
      .register('logger', 'winston', logger)

    this.raven = new Sentry(this, options.botConfig)

    this
      .createPlugin('api', APIPlugin, options)

    this
      .register('modules', resolve('modules'))
      .unregister('middleware', true)
      .register('middleware', resolve('middleware'))
      .register('commands', resolve('commands'), { groupedCommands: true })

    if (options.locales) this.register('i18n', options.locales)
  }

  get api () {
    return this.plugins.get('api')
  }
}

const config = require(resolveConfig('config'))

const bot = new Navi({
  token: config.bot.token,
  messageLimit: 0,
  autoreconnect: true,
  botConfig: config
})

bot.register('api', 'google', GoogleAuthAPI, require(resolveConfig('client_secret')).installed)

bot.guildManager = new GuildManager(bot)

async function initStatusClock () {
  let index = 0
  const statuses = [
    'https://navi.social',
    '%s guilds',
    '%d users'
  ]
  setInterval(function () {
    index = (index + 1) % statuses.length
    this.editStatus('online', {
      name: statuses[index]
        .replace('%s', this.guilds.size)
        .replace('%d', this.users.size),
      type: 0,
      url: 'https://navi.social'
    })
  }.bind(bot), 20000)
}

bot.once('ready', () => {
  initStatusClock()
  setInterval(handleEvents.bind(bot), (config.calendar.pollingRate || 30) * 1000)
})

Mongoose(config.mongo).then(db => {
  bot.mongoose = db
  bot.models = db.models
  bot.run()
})
