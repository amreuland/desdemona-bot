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

const bot = new Client({
  token: config.bot.token,
  modules: resolve('modules')
})

const raven = new Sentry(bot, config)

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: 'silly',
      colorize: true,
      label: `C PRIMARY`,
      timestamp: () => `[${chalk.grey(moment().format('HH:mm:ss'))}]`
    })
  ]
})

bot.on('commander:registered', ({ trigger, group, aliases } = {}) =>
  bot.logger.debug(`Command '${trigger}' in group '${group}' registered with ${aliases} aliases`)
)

bot
  .unregister('logger', 'console')
  .register('logger', 'winston', logger)
  .unregister('middleware', true)
  .register('middleware', resolve('middleware'))
  .register('commands', resolve('commands'), { groupedCommands: true })

bot.on('error', err => raven.captureException(err))

bot.run()
