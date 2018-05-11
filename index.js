'use strict'

global.Promise = require('bluebird')

const chalk = require('chalk')
const path = require('path')
const moment = require('moment')
const { Crystal, utils: { delay } } = require('./src/sylphy')

require('longjohn')

const config = require('./config/config')

const timestamp = () => `[${chalk.grey(moment().format('HH:mm:ss'))}]`

const cluster = new Crystal(
  path.join('src', 'navi.js'),
  config.cluster.startId,
  config.cluster.processCount
)

cluster.on('clusterCreate', id => {
  console.log(`${timestamp()} [MASTER]: CLUSTER ${chalk.cyan.bold(id)} ONLINE`)
})

cluster.on('clusterExit', (pid, id) => {
  console.log(`${timestamp()} [MASTER]: CLUSTER ${chalk.cyan.bold(id)} SHUTDOWN`)
})

cluster.createClusters()
  .then(() => console.log(`${timestamp()} [MASTER]: ` + chalk.magenta('Live')))
  .catch(err => console.error(err))
