'use strict'

class NaviTask {
  constructor (options) {


    this._options = options
  }

  set _options (args = {}) {
    const {
      name,
      description,
      group,
      interval
    } = args
  }


  async run (client, time) { return true }
}

module.exports = NaviTask
