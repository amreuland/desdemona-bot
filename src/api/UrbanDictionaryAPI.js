'use strict'

const request = require('request-promise')

class UrbanDictionaryAPI {
  constructor () {
    this.baseAPI = 'https://api.urbandictionary.com/v0'
  }

  get (path, base = this.baseAPI, key = this.apiKey) {
    return request(`${base}${path}`)
  }

  lookupTerm (term) {
    return this.get(`/define?term=${term}`)
      .then(JSON.parse)
  }
}

module.exports = UrbanDictionaryAPI
