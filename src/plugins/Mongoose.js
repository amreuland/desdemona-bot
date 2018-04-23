'use strict'

const path = require('path')
const fs = require('fs')
const util = require('util')

const mongoose = require('mongoose')

const { Collection, utils } = require('sylphy')

class MongoosePlugin extends Collection {
  constructor (client, options = {mongo: {}}) {
    super()
    this._client = client

    this.config = options.mongo
  }

  register (schemas) {
    switch (typeof schemas) {
      case 'string': {
        const filepath = path.join(process.cwd(), schemas)
        if (!fs.existsSync(filepath)) {
          throw new Error(`Folder path ${filepath} does not exist`)
        }

        const schms = utils.isDir(filepath) ? utils.requireAll(filepath) : require(filepath)
        return this.register(schms)
      }

      case 'object': {
        if (Array.isArray(schemas)) {
          for (const schema of schemas) {
            this.attach(schema)
          }
          return this
        }
        for (const key in schemas) {
          this.attach(schemas[key])
        }
        return this
      }

      default: {
        throw new Error('Path supplied is not an object or string')
      }
    }
  }

  attach (Schema) {
    if (Schema instanceof Array) {
      for (const schema of Schema) {
        this.attach(schema)
      }
      return this
    }

    if (!Schema.name || !Schema.schema) {
      this._client.throwOrEmit('mongoose:error', new Error(`Invalid model/schema - ${util.inspect(Schema)}`))
    }

    let name = Schema.name

    if (this.has(name)) {
      this._client.throwOrEmit('mongoose:error', new Error(`Duplicate model/schema - ${name}`))
      return this
    }

    let schema = mongoose.Schema(Schema.schema)

    let model = mongoose.model(name, schema)

    this.set(name, model)

    this[name] = model

    /**
     * Fires when a schema is registered
     *
     * @event Navi#mongoose:registered
     * @type {Object}
     * @prop {String} name Schema name
     * @prop {Number} count Number of loaded schemas
     */
    this._client.emit('mongoose:registered', {
      name: Schema.name,
      count: this.size
    })
    return this
  }

  run () {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('open', () => {
        this._client.emit('mongoose:connected')
        resolve()
      })

      mongoose.connect(this.config.uri)
    })
  }
}

module.exports = MongoosePlugin
