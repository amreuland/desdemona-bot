'use strict'

class NaviService {
  constructor (client, options) {
    if (this.constructor === NaviService) {
      throw new Error('Must extend abstract NaviService')
    }

    this._client = client

    this._options = options
  }

  get client () { return this._client }

  set _options (args = {}) {
    const {
      name,
      options = {}
    } = args

    this.name = name

    if (!this.name) {
      throw new Error(`${this.constructor.name} module is not named`)
    }

    this.options = options
  }
}

module.exports = NaviService
