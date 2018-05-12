'use strict'

const Redis = require('ioredis')

const { Collection } = require('../sylphy')

class RedisPlugin extends Collection {
  constructor (client, options = {}) {
    super()
    this._client = client
  }

  register (name, options) {
    if (this.has(name)) {
      this._client.throwOrEmit('redis:error', new Error(`Duplicate Redis DB - ${name}`))
      return this
    }

    let redisdb = new Redis(options)

    redisdb.on('connect', () => this._client.emit('redis:connect', name))
    redisdb.on('ready', () => this._client.emit('redis:ready', name))
    redisdb.on('error', (err) => this._client.emit('redis:ready', err, name))
    redisdb.on('close', () => this._client.emit('redis:close', name))
    redisdb.on('reconnecting', () => this._client.emit('redis:reconnecting', name))
    redisdb.on('end', () => this._client.emit('redis:end', name))
    redisdb.on('select', (id) => this._client.emit('redis:select', id, name))

    this.set(name, redisdb)

    Object.defineProperty(this, name, {
      get: function () { return this.get(name) }
    })

    /**
     * Fires when a redis db is registered
     *
     * @event Navi#redis:registered
     * @type {Object}
     * @prop {String} name RedisDB name
     * @prop {Number} count Number of registered DBs
     */
    this._client.emit('redis:registered', {
      name: name,
      count: this.size
    })
    return this
  }

  unregister (name) {
    let item = this.get(name)
    item.removeAllListeners()
    delete this[name]
    this.delete(name)
    return this
  }
}

module.exports = RedisPlugin
