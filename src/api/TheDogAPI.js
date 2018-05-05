'use strict'

const request = require('request-promise')

class TheDogAPI {
  constructor () {
    this.baseAPI = 'https://api.thedogapi.co.uk/v2'
  }

  get (path, base = this.baseAPI, key = this.apiKey) {
    return request(`${base}${path}`)
  }

  getDogs (count = 1, size = 'med') {
    return this.get(`/dog.php?limit=${count}&size=${size}`)
      .then(JSON.parse)
  }

}

module.exports = TheDogAPI
