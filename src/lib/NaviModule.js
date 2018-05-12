'use strict'

const path = require('path')
const fs = require('fs')

const { requireAll, isDir } = require('../sylphy').utils

class NaviModule {
  constructor (client, options) {
    if (this.constructor === NaviModule) {
      throw new Error('Must extend abstract NaviModule')
    }

    this._client = client

    this._options = options
  }

  getModulePath () {
    throw new Error(`Must override method 'getModulePath' in '${this.constructor.name}'`)
  }

  set _options (args = {}) {
    const {
      name,
      description,
      services = false,
      commands = false,
      middleware = false,
      listeners = false,
      tasks = false,
      options = {}
    } = args

    this.name = name

    if (!this.name) {
      throw new Error(`${this.constructor.name} module is not named`)
    }

    this.description = description
    this.options = options

    this.services = []
    this.commands = []
    this.middleware = []
    this.listeners = []
    this.tasks = []

    this._resolveComponent('services', services)
    this._resolveComponent('commands', commands)
    this._resolveComponent('middleware', middleware)
    this._resolveComponent('listeners', listeners)
    this._resolveComponent('tasks', tasks)
  }

  _resolveComponent (component, items) {
    if (!items) {
      return this
    }

    if (items === true) {
      items = component
    }

    switch (typeof items) {
      case 'string': {
        const filepath = path.join(this.getModulePath(), items)
        if (!fs.existsSync(filepath)) {
          throw new Error(`Folder path ${filepath} does not exist`)
        }
        const itms = isDir(filepath) ? requireAll(filepath) : require(filepath)
        return this._resolveComponent(component, itms)
      }
      case 'object': {
        if (Array.isArray(items)) {
          for (const item of items) {
            if (!item) {
              continue
            }
            this[component].push(item)
          }
          return this
        }
        for (let item in items) {
          if (!items[item]) {
            continue
          }
          this[component].push(items[item])
        }
        return this
      }
      default: {
        throw new Error('Path supplied is not an object or string')
      }
    }
  }
}

module.exports = NaviModule
