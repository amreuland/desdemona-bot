'use strict'

const { Collection } = require('../sylphy')

class Loader extends Collection {
  constructor (client, options = {}) {
    super()
    this._client = client
  }

  register (Module) {
    let module = typeof Module === 'function' ? new Module(this._client) : Module

    let name = module.name

    if (this.has(name)) {
      this._client.throwOrEmit('loader:error', new Error(`Duplicate Module - ${name}`))
      return this
    }

    this.set(name, module)

    let commands = module.commands
    let listeners = module.listeners
    let middleware = module.middleware
    let tasks = module.tasks

    this._client.register('middleware', middleware, {group: name})
    this._client.register('listeners', listeners, {group: name})
    this._client.register('commands', commands, {group: name})
    this._client.register('tasks', tasks, {group: name})

    this._client.emit('loader:registered', {
      name: name,
      count: this.size
    })
    return this
  }
}

module.exports = Loader
