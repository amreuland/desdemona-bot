'use strict'

// const { Base } = require('sylphy')

class Interface {
  constructor (options) {
    // super(client)
    if (this.constructor === Interface) {
      throw new Error('Must extend abstract Interface')
    }

    this._options = options
  }

  set _options ({name, options = {}} = {}) {
    if (typeof name === 'undefined') throw new Error(`${this.constructor.name} is not named`)

    this.name = name
  }
}

module.exports = Interface
