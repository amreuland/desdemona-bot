'use strict'

const path = require('path')
const fs = require('fs')
// const util = require('util')

const { Collection, utils } = require('sylphy')

class APIPlugin extends Collection {
  constructor (client, options = {}) {
    super()
    this._client = client
  }

  register (apis, options = {}) {
    switch (typeof apis) {
      case 'string': {
        const filepath = path.join(process.cwd(), apis)
        if (!fs.existsSync(filepath)) {
          throw new Error(`Folder path ${filepath} does not exist`)
        }

        const apiReq = utils.isDir(filepath) ? utils.requireAll(filepath) : require(filepath)
        return this.register(apiReq, options)
      }

      case 'object': {
        if (Array.isArray(apis)) {
          for (const api of apis) {
            this.attach(api, options)
          }
          return this
        }
        for (const key in apis) {
          this.attach(apis[key], options)
        }
        return this
      }

      default: {
        throw new Error('Path supplied is not an object or string')
      }
    }
  }

  attach (API, options = {}) {
    if (API instanceof Array) {
      for (const api of API) {
        this.attach(api, options)
      }
      return this
    }

    let api = typeof API === 'function' ? new API(options) : API

    let name = api.name

    if (this.has(name)) {
      this._client.throwOrEmit('api:error', new Error(`Duplicate API - ${name}`))
      return this
    }

    this.set(name, api)

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
