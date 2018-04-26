'use strict'

global.Promise = require('bluebird')

const VERSION = '0.0.1'

const chalk = require('chalk')
const path = require('path')
const winston = require('winston')
const moment = require('moment')

const { Sentry } = require('./lib')

const { APIPlugin, MongoosePlugin } = require('./plugins')

const handleEvents = require('./lib/handleEvents')

const {
  CleverbotAPI, GoogleAPI, LeagueAPI, OverwatchAPI,
  PastebinAPI, SoundCloudAPI, SteamAPI
} = require('./api')

const { Client, utils } = require('sylphy')

utils.emojis = require('../res/emoji')

const resolve = (str) => path.join('src', str)
const resolveConfig = (str) => path.join('..', 'config', str)

class Navi extends Client {
  constructor (options = {}) {
    super(options)

    const logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          level: 'silly',
          colorize: true,
          label: options.processShards > 1 ? `C ${options.firstShardID}-${options.lastShardID}` : `C ${options.processID}`,
          timestamp: () => `[${chalk.grey(moment().format('HH:mm:ss'))}]`
        })
      ]
    })

    this
      .unregister('logger', 'console')
      .register('logger', 'winston', logger)

    this.raven = new Sentry(this, options)

    this
      .createPlugin('api', APIPlugin, options)
      .createPlugin('db', MongoosePlugin, options)

    this
      .register('i18n', path.join(__dirname, '..', 'res/i18n'))
      .register('modules', resolve('modules'))
      .register('db', resolve('schemas'))
      .unregister('middleware', true)
      .register('middleware', resolve('middleware'))
      .register('commands', resolve('commands'), { groupedCommands: true })
  }

  get api () {
    return this.plugins.get('api')
  }

  get db () {
    return this.plugins.get('db')
  }

  /**
   * Runs the bot
   * @returns {Promise}
   */
  run () {
    if (typeof this.token !== 'string') {
      throw new TypeError('No bot token supplied')
    }

    return Promise.each(this.plugins.toArray(), plugin => {
      if (typeof plugin.run === 'function') {
        return plugin.run()
      }

      return Promise.resolve()
    }).then(() => this.connect())
  }
}

const config = require(resolveConfig('config'))

let processID = parseInt(process.env['PROCESS_ID'], 10)
let processShards = config.cluster.shardsPerProcess
let firstShardID = processID * processShards
let lastShardID = firstShardID + processShards - 1
let maxShards = processShards * config.cluster.processCount

const bot = new Navi({
  version: VERSION,
  token: config.bot.token,
  prefix: config.bot.prefix,
  messageLimit: 0,
  autoreconnect: true,
  mongo: config.mongo,
  botConfig: config,
  processID,
  processShards,
  firstShardID,
  lastShardID,
  maxShards
})

const userBot = new Client({
  token: config.user.token,
  selfbot: true
})

bot.userBot = userBot

bot.register('api', 'google', GoogleAPI, require(resolveConfig('client_secret')).installed)
bot.register('api', 'cleverbot', CleverbotAPI)
bot.register('api', 'lol', LeagueAPI)
bot.register('api', 'overwatch', OverwatchAPI)
bot.register('api', 'pastebin', PastebinAPI)
bot.register('api', 'soundcloud', SoundCloudAPI)
bot.register('api', 'steam', SteamAPI, config.steam.apiKey)

async function initStatusClock () {
  let index = 0
  const statuses = [
    'https://navi.social',
    '%s guilds',
    'Use \'n!help\'',
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
  }.bind(bot), 60000)
}

bot.once('ready', () => {
  initStatusClock()
  setInterval(handleEvents.bind(bot), (config.calendar.pollingRate || 30) * 1000)
})

bot.run().then(() => userBot.run())
