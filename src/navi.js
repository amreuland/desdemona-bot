'use strict'

global.Promise = require('bluebird')

const VERSION = '0.1.0'

const chalk = require('chalk')
const path = require('path')
const winston = require('winston')
const moment = require('moment')

const { Sentry } = require('./lib')

const { APIPlugin, MongoosePlugin, RedisPlugin, Loader, Tasker } = require('./plugins')

const modules = require('./modules')

const { Client, utils } = require('sylphy')

utils.emojis = require('../res/emoji')

const resolve = (str) => path.join('src', str)
const resolveConfig = (str) => path.join(process.cwd(), 'config', str)

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
      .createPlugin('cache', RedisPlugin, options)
      .createPlugin('db', MongoosePlugin, options)
      .createPlugin('module', Loader, options)
      .createPlugin('tasks', Tasker, options)

    this
      .register('i18n', path.join(process.cwd(), 'res/i18n'))
      .register('listeners', resolve('listeners'))
      .register('db', resolve('schemas'))
      .unregister('middleware', true)
      .register('middleware', resolve('middleware'))
  }

  get api () {
    return this.plugins.get('api')
  }

  get cache () {
    return this.plugins.get('cache')
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

for (const name in config.cache) {
  bot.register('cache', name, config.cache[name])
}

for (const name in modules) {
  bot.register('module', modules[name])
}

bot.run()
// .then(() => userBot.run())
