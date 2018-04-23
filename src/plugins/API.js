'use strict'

const { Collection } = require('sylphy')

class APIPlugin extends Collection {
  constructor (client, options = {}) {
    super()
    this._client = client
  }

  register (name, API, options) {
    if (this.has(name)) {
      this._client.throwOrEmit('api:error', new Error(`Duplicate API - ${name}`))
      return this
    }

    this.set(name, (typeof API === 'function' ? new API(options) : API))

    Object.defineProperty(this, name, {
      get: function () { return this.get(name) }
    })

    /**
     * Fires when an api is registered
     *
     * @event Navi#api:registered
     * @type {Object}
     * @prop {String} name API name
     * @prop {Number} count Number of registered apis
     */
    this._client.emit('api:registered', {
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

module.exports = APIPlugin
