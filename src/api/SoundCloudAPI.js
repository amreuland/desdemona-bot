'use strict'

const { Interface } = require('../lib')

class SoundCloudAPI extends Interface {
  constructor (...args) {
    super({
      name: 'soundcloud'
    })
  }
}

module.exports = SoundCloudAPI
