'use strict'

const { NaviTask } = require.main.require('./lib')

class StatusMessageTask extends NaviTask {
  constructor (opts) {
    super({
      name: 'statusMessage',
      interval: 60000
    })

    this.statuses = [
      'https://navi.social',
      '%s guilds',
      'Use %ahelp',
      '%d users'
    ]

    this.index = 0
  }

  run (client) {
    this.index = (this.index + 1) % this.statuses.length
    client.editStatus('online', {
      name: this.statuses[this.index]
        .replace('%s', client.guilds.size)
        .replace('%d', client.users.size)
        .replace('%a', client.prefix),
      type: 0,
      url: 'https://navi.social'
    })
  }
}

module.exports = StatusMessageTask
