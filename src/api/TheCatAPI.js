'use strict'

const xmlParser = require('xml2json')
const request = require('request-promise')
// http://thecatapi.com

class TheCatAPI {
  constructor (key) {
    this.apiKey = key

    this.baseAPI = 'http://thecatapi.com/api'
  }

  get (path, base = this.baseAPI, key = this.apiKey) {
    return request(`${base}${path}${path.includes('?') ? '&' : '?'}key=${key}`)
  }

  getCats (count = 2, size = 'med') {
    return this.get(`/images/get?format=xml&results_per_page=${count}&size=${size}`)
      .then(xmlParser.toJson)
      .then(JSON.parse)
  }

}

module.exports = TheCatAPI
