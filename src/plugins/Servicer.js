'use strict'

const path = require('path')
const fs = require('fs')

const { Collection, utils } = require('../sylphy')

class Servicer extends Collection {
  constructor (client, options = {}) {
    super()
    this._client = client
  }

  register (services) {
    switch (typeof services) {
      case 'string': {
        const filepath = path.join(process.cwd(), services)
        if (!fs.existsSync(filepath)) {
          throw new Error(`Folder path ${filepath} does not exist`)
        }

        const srvcs = utils.isDir(filepath) ? utils.requireAll(filepath) : require(filepath)
        return this.register(srvcs)
      }

      case 'object': {
        if (Array.isArray(services)) {
          for (const service of services) {
            this.attach(service)
          }
          return this
        }
        for (const key in services) {
          this.attach(services[key])
        }
        return this
      }

      default: {
        throw new Error('Path supplied is not an object or string')
      }
    }
  }

  attach (Service) {
    if (Service instanceof Array) {
      for (const service of Service) {
        this.attach(service)
      }
      return this
    }

    let service = typeof Service === 'function' ? new Service(this._client) : Service

    let name = service.name

    if (this.has(name)) {
      this._client.throwOrEmit('services:error', new Error(`Duplicate service - ${name}`))
      return this
    }

    this.set(name, service)

    Object.defineProperty(this, name, {
      get: () => this.get(name)
    })

    this._client.emit('services:registered', {
      name: name,
      count: this.size
    })
    return this
  }
}

module.exports = Servicer
