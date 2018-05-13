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
      'in %s guilds',
      'Use %ahelp',
      'with %d users',
      'Navi V%v'
    ]

    this.index = 0
  }

  run (client) {
    this.index = (this.index + 1) % this.statuses.length
    client.editStatus('online', {
      name: this.statuses[this.index]
        .replace('%v', client.version)
        .replace('%s', client.guilds.size)
        .replace('%d', client.users.size)
        .replace('%a', client.prefix),
      type: 0,
      url: 'https://navi.social'
    })
  }
}

module.exports = StatusMessageTask
