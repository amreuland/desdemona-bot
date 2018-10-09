'use strict'

//const xmlParser = require('xml2json')
const request = require('request-promise')

class TheDogAPI {
  constructor (key) {
    this.apiKey = key

    this.baseAPI = 'https://api.thedogapi.com/v1'
  }

  get (path, base = this.baseAPI, key = this.apiKey) {
    return request({
      uri: `${base}${path}`,
      headers: {
        'x-api-key': key
      }
    })
  }

  getDogs (count = 2, size = 'med') {
    return this.get(`/images/search?format=json&limit=${count}&size=${size}`)
      //.then(xmlParser.toJson)
      .then(JSON.parse)
  }

}

module.exports = TheDogAPI
