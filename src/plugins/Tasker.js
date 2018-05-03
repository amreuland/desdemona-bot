'use strict'

const { Collection } = require('sylphy')

class Tasker extends Collection {
  constructor (client, options = {}) {
    super()
    this._client = client
  }

  register (name, Task, options) {

  }
}

module.exports = Tasker
