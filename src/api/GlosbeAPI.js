'use strict'

const request = require('request-promise')

class GlosbeAPI {
  constructor (key) {
    this.apiKey = key

    this.baseAPI = 'https://glosbe.com/gapi'
  }

  get (path, base = this.baseAPI, key = this.apiKey) {
    return request(`${base}${path}${path.includes('?') ? '&' : '?'}key=${key}`)
  }

  getA (count = 2, size = 'med') {
    return this.get(`/images/get?format=xml&results_per_page=${count}&size=${size}`)
      .then(JSON.parse)
  }
}

module.exports = GlosbeAPI
