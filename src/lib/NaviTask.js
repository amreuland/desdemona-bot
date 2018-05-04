'use strict'

class NaviTask {
  constructor (options) {
    if (this.constructor === NaviTask) {
      throw new Error('Must extend abstract NaviModule')
    }

    this._options = options
  }

  set _options (args = {}) {
    const {
      name,
      // description,
      interval
    } = args

    this.name = name

    if (!this.name) {
      throw new Error(`${this.constructor.name} task is not named`)
    }

    // this.description = description
    this.interval = interval
  }

  async run (client) { return true }
}

module.exports = NaviTask
