'use strict'

const redis = require('redis')

class RedisCache {
  constructor (addr) {
    this.cache = redis.createClient(addr)
  }
}

module.exports = RedisCache
