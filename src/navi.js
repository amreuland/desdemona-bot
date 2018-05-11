'use strict'

global.Promise = require('bluebird')

const Eris = require('eris').Client

const chalk = require('chalk')
const path = require('path')
const winston = require('winston')
const moment = require('moment')

const packageJson = require(path.join(process.cwd(), 'package'))

const { Sentry } = require('./lib')

const { APIPlugin, MongoosePlugin, RedisPlugin, Loader, Tasker } = require('./plugins')

const modules = require('./modules')

const { Commander, Router, Bridge, Interpreter, Logger, Collection, utils } = require('./sylphy')

const resolve = (str) => path.join('src', str)
const resolveConfig = (str) => path.join(process.cwd(), 'config', str)

const apis = utils.requireAll(path.join(process.cwd(), resolve('api')))

class Navi extends Eris {
  /**
   * Creates a new Client instance
   * @arg {Object} options An object containing sylphy's and/or Eris client options
   * @arg {String} options.token Discord bot token
   * @arg {String} [options.prefix='!'] Default prefix for commands
   * @arg {String} [options.admins=[]] Array of admin IDs
   * @arg {String} [options.selfbot=false] Option for selfbot mode
   * @arg {String} [options.commands] Relative path to commands folder
   * @arg {String} [options.listeners] Relative path to listeners folder
   * @arg {String} [options.middleware] Relative path to middleware folder
   * @arg {String} [options.locales] Relative path to locales folder
   * @arg {String} [options.resolvers] Relative path to resolvers folder
   * @arg {Boolean} [options.suppressWarnings=false] Option to suppress console warnings
   * @arg {Boolean} [options.noDefaults=false] Option to not use built-in plugins
   */
  constructor (options = {}) {
    super(options.token, options)

    this.selfbot = options.selfbot
    this.prefix = options.prefix || '!'
    this.suppressWarnings = options.suppressWarnings
    this.admins = Array.isArray(options.admins) ? options.admins : []
    this.version = packageJson.version

    this.plugins = new Collection()

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
      .createPlugin('logger', Logger, options)
      .unregister('logger', 'console')
      .register('logger', 'winston', logger)

    this.logger.info(`Starting Navi - Version: ${chalk.red.bold(packageJson.version)}`)

    this.raven = new Sentry(this, options)

    this
      .createPlugin('commands', Commander, options)
      .createPlugin('listeners', Router, options)
      .createPlugin('middleware', Bridge, options)
      .createPlugin('i18n', Interpreter, options)
      .createPlugin('api', APIPlugin, options)
      .createPlugin('cache', RedisPlugin, options)
      .createPlugin('db', MongoosePlugin, options)
      .createPlugin('module', Loader, options)
      .createPlugin('tasks', Tasker, options)

    this
      .register('i18n', path.join(process.cwd(), 'res/i18n'))
      .register('middleware', path.join(__dirname, 'middleware'))
      .register('listeners', resolve('listeners'))
      .register('db', resolve('schemas'))
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

  get logger () {
    return this.plugins.get('logger')
  }

  /**
   * Creates a plugin
   * @arg {String} type The type of plugin
   * @arg {Plugin} Plugin Plugin class
   * @arg {Object} [options] Additional plugin options
   * @returns {Client}
   */
  createPlugin (type, Plugin, options) {
    const plugin = new Plugin(this, options)
    this.plugins.set(type, plugin)
    return this
  }

  /**
   * Registers plugins
   * @arg {String} type The type of plugin<br />
   * Defaults: `commands`, `listeners`, `middleware`, `resolvers`, `ipc`
   * @arg {...*} args Arguments supplied to the plugin
   * @returns {Client}
   */
  register (type, ...args) {
    if (typeof type !== 'string') {
      throw new Error('Invalid type supplied to register')
    }
    const plugin = this.plugins.get(type)
    if (!plugin) {
      throw new Error(`Plugin type ${type} not found`)
    }
    if (typeof plugin.register === 'function') plugin.register(...args)
    return this
  }

  /**
   * Unregisters plugins
   * @arg {String} type The type of plugin<br />
   * Defaults: `commands`, `listeners`, `middleware`, `resolvers`, `ipc`
   * @arg {...*} args Arguments supplied to the plugin
   * @returns {Client}
   */
  unregister (type, ...args) {
    if (typeof type !== 'string') {
      throw new Error('Invalid type supplied to register')
    }
    const plugin = this.plugins.get(type)
    if (!plugin) {
      throw new Error(`Plugin type ${type} not found`)
    }
    if (typeof plugin.unregister === 'function') plugin.unregister(...args)
    return this
  }

  /**
   * Unloads files from the require cache
   * @arg {String} filepath A relative or absolute directory path, file path or file name
   * @returns {Client}
   */
  unload (filepath) {
    Object.keys(require.cache).forEach(file => {
      const str = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath)
      if (str === file || file.startsWith(str)) {
        delete require.cache[require.resolve(file)]
      }
    })
    return this
  }

  /**
   * Emits an error or throws when there are no listeners
   * @arg {String} event Event name
   * @arg {Error} error Thrown or emitted error
   * @private
   */
  throwOrEmit (event, error) {
    if (!this.listeners(event).length) {
      throw error
    }
    this.emit(event, error)
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
  token: config.bot.token,
  prefix: config.bot.prefix,
  messageLimit: 0,
  autoreconnect: true,
  mongo: config.mongo,
  botConfig: config,
  admins: config.admins,
  processID,
  processShards,
  firstShardID,
  lastShardID,
  maxShards
})

bot.register('api', 'google', apis.GoogleAPI, config.apis.google)
bot.register('api', 'cats', apis.TheCatAPI, config.apis.thecatapi)
bot.register('api', 'dogs', apis.TheDogAPI)
bot.register('api', 'urbandict', apis.UrbanDictionaryAPI)

for (const name in config.cache) {
  bot.register('cache', name, config.cache[name])
}

for (const name in modules) {
  bot.register('module', modules[name])
}

bot.run()
