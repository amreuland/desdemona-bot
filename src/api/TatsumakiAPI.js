'use strict'

const tatsumakijs = require('tatsumaki.js')

class TatsumakiAPI extends tatsumakijs.Client {
  constructor (apiKey) {
    super(apiKey)
    this.apiKey = apiKey
  }
}

module.exports = TatsumakiAPI
