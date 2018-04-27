'use strict'

const { Collection } = require('sylphy')

class RedisPlugin extends Collection {
  constructor (client, options = {}) {
    super()
    this._client = client
  }

  register (name, RedisDB, options) {
    let redisdb = typeof RedisDB === 'function' ? new RedisDB(options) : RedisDB

    if (this.has(name)) {
      this._client.throwOrEmit('redis:error', new Error(`Duplicate Redis DB - ${name}`))
      return this
    }

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
    delete this[name]
    this.delete(name)
    return this
  }
}

module.exports = RedisPlugin
