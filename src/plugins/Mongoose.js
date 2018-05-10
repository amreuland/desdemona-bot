'use strict'

const path = require('path')
const fs = require('fs')
const util = require('util')

const Mongoose = require('mongoose')

Mongoose.Promise = require('bluebird')

const { Collection, utils } = require('sylphy')

class MongoosePlugin extends Collection {
  constructor (client, options = {mongo: {}}) {
    super()
    this._client = client

    this.config = options.mongo
  }

  get mongoose () {
    return Mongoose
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

    let schema = Mongoose.Schema(Schema.schema, Schema.options || {})

    if (Schema.virtuals) {
      for (const key in Schema.virtuals) {
        schema.virtual(key, Schema.virtuals[key])
      }
    }

    // schema.plugin(findOrCreatePlugin)

    schema.static('findOneOrCreate', function findOneOrCreate (condition, doc) {
      let opts = {
        new: true,
        upsert: true
      }
      return this.findOneAndUpdate(condition, doc, opts)
    })

    let model = Mongoose.model(name, schema)

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
      name,
      count: this.size
    })
    return this
  }

  run () {
    return new Promise((resolve, reject) => {
      Mongoose.connection.once('open', () => {
        this._client.emit('mongoose:connected')
        resolve()
      })

      Mongoose.connect(this.config.uri, err => {
        if (err) {
          this._client.throwOrEmit('mongoose:error', err)
        }
      })
    })
  }
}

module.exports = MongoosePlugin

// function findOrCreatePlugin (schema, options) {
//   schema.statics.findOrCreate = function findOrCreate (conditions, doc, options, callback) {
//     var self = this
//     // When using Mongoose 5.0.x and upper, we must use self.base.Promise
//     var Promise = self.base.Promise.ES6 ? self.base.Promise.ES6 : self.base.Promise
//     if (arguments.length < 4) {
//       if (typeof options === 'function') {
//         // Scenario: findOrCreate(conditions, doc, callback)
//         callback = options
//         options = {}
//       } else if (typeof doc === 'function') {
//         // Scenario: findOrCreate(conditions, callback)
//         callback = doc
//         doc = {}
//         options = {}
//       } else {
//         // Scenario: findOrCreate(conditions[, doc[, options]])
//         return new Promise(function (resolve, reject) {
//           self.findOrCreate(conditions, doc, options, function (ex, result, created) {
//             if (ex) {
//               reject(ex)
//             } else {
//               resolve(result, created)
//             }
//           })
//         })
//       }
//     }
//     this.findOne(conditions, function (err, result) {
//       if (err || result) {
//         if (options && options.upsert && !err) {
//           self.update(conditions, doc, function (err, count) {
//             self.findById(result._id, function (err, result) {
//               callback(err, result, false)
//             })
//           })
//         } else {
//           callback(err, result, false)
//         }
//       } else {
//         for (var key in doc) {
//           conditions[key] = doc[key]
//         }

//         // If the value contain `$` remove the key value pair
//         var keys = Object.keys(conditions)

//         for (var z = 0; z < keys.length; z++) {
//           var value = JSON.stringify(conditions[keys[z]])
//           if (value && value.indexOf('$') !== -1) {
//             delete conditions[keys[z]]
//           }
//         }

//         var obj = new self(conditions)
//         obj.save(function (err) {
//           callback(err, obj, true)
//         })
//       }
//     })
//   }
// }
