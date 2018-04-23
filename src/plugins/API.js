'use strict'

// const { Collection } = require('sylphy')

class APIPlugin {
  constructor (client, options = {}) {
    // super()

    this._client = client
  }

  register (name, API, options) {
    // this.set(name, typeof API === 'function' ? new API(options) : API)

    this[name] = (typeof API === 'function' ? new API(options) : API)
    // Object.defineProperty(this, name, {
    //   get: function () { return this.get(name) }
    // })

    return this
  }

  unregister (name) {
    // this.delete(name)
    delete this[name]
    return this
  }
}

module.exports = APIPlugin
