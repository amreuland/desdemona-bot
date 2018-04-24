'use strict'

global.Promise = require('bluebird')

const chalk = require('chalk')
const path = require('path')
const moment = require('moment')
const { Crystal, utils: { delay } } = require('sylphy')
require('longjohn')

const config = require('./config/config')

const timestamp = () => `[${chalk.grey(moment().format('HH:mm:ss'))}]`

class Crystal2 extends Crystal {
  constructor (startId, ...args) {
    super(...args)

    this._startId = startId
  }

  /** Spawns new clusters */
  async createClusters () {
    for (let i = 0; i < this._count; i++) {
      this.createCluster(i + this._startId)
      await delay(6000)
    }
  }
}

const cluster = new Crystal2(
  config.cluster.startId,
  path.join('src', 'navi.js'),
  config.cluster.processCount
)

cluster.on('clusterCreate', id => {
  console.log(`${timestamp()} [MASTER]: CLUSTER ${chalk.cyan.bold(id)} ONLINE`)
})

cluster.createClusters()
  .then(() => console.log(`${timestamp()} [MASTER]: ` + chalk.magenta('Live')))
  .catch(err => console.error(err))
