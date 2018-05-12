const path = require('path')
const fs = require('fs')

const { requireRecursive, isDir, Collection } = require('../util')

/**
 * Router class for event routing
 * @prop {Object} events Event map
 */
class Router extends Collection {
  /**
   * Creates a new Router instance
   * @arg {Client} client Client instance
   */
  constructor (client) {
    super()
    this._client = client
    this._cached = []
    this.events = {}
  }

  /**
   * Class, object or function that can be utilised as a listener
   * @typedef {(Object|function)} AbstractListener
   * @prop {String} name Listener name
   * @prop {Object} events Object mapping Eris event name to a function name
   * @example
   * // in constructor
   * events: {
   *   messageCreate: 'onMessage'
   * }
   *
   * // in class or object
   * onMessage (msg) {
   *   // handle message
   * }
   */

  /**
   * Registers listeners
   * @arg {String|Object|Array} listeners An object, array or relative path to a folder or file to load listeners from
   */
  register (listeners) {
    switch (typeof listeners) {
      case 'string': {
        const filepath = path.join(process.cwd(), listeners)
        if (!fs.existsSync(filepath)) {
          throw new Error(`Folder path ${filepath} does not exist`)
        }
        const mods = isDir(filepath) ? requireRecursive(filepath) : require(filepath)
        this._cached.push(listeners)
        return this.register(mods)
      }
      case 'object': {
        if (Array.isArray(listeners)) {
          for (const listener of listeners) {
            this.attach(listener)
          }
          return this
        }
        for (const key in listeners) {
          this.attach(listeners[key])
        }
        return this
      }
      default: {
        throw new Error('Path supplied is not an object or string')
      }
    }
  }

  /**
   * Attaches a listener
   * @arg {AbstractListener} Listener Listener class, object or function
   */
  attach (Listener) {
    if (Listener instanceof Array) {
      for (const mod of Listener) {
        this.attach(mod)
      }
      return this
    }
    const listener = typeof Listener === 'function' ? new Listener(this._client) : Listener
    this.set(listener.name, listener)
    for (const event in listener.events) {
      if (typeof this.events[event] === 'undefined') {
        this.record(event)
      }

      const listen = listener.events[event]
      if (typeof listener[listen] !== 'function') {
        this._client.throwOrEmit('router:error', new TypeError(`${listen} in ${listener.name} is not a function`))
        return this
      }

      this.events[event] = Object.assign(this.events[event] || {}, { [listener.name]: listen })
    }

    /**
     * Fires when a listener is registered
     *
     * @event Client#router:registered
     * @type {Object}
     * @prop {String} name Listener name
     * @prop {Number} events Number of events in the listener
     * @prop {Number} count Number of loaded listeners
     */
    this._client.emit('router:registered', {
      name: listener.name,
      events: Object.keys(listener.events || {}).length,
      count: this.size
    })
    return this
  }

  /**
   * Registers an event
   * @arg {String} event Event name
   */
  record (event) {
    this._client.on(event, (...args) => {
      const events = this.events[event] || {}
      for (const name in events) {
        const listener = this.get(name)
        if (!listener) continue
        try {
          if (!listener._client) args.push(this._client)
          listener[events[name]](...args)
        } catch (err) {
          this._client.throwOrEmit('router:runError', err)
        }
      }
    })
    return this
  }

  /**
   * Initialises all listeners
   */
  run () {
    this.forEach(listener => {
      if (typeof listener.init === 'function') {
        listener.init()
      }
    })
    return this
  }

  /**
   * Unregisters all listeners
   */
  unregister () {
    return this.destroy()
  }

  /**
   * Destroys all listeners and unloads them
   */
  destroy () {
    for (const event in this.events) {
      this.events[event] = {}
    }
    this.forEach(listener => {
      if (typeof listener.unload === 'function') {
        listener.unload()
      }
      listener = null
    })
    this.clear()
    return this
  }

  /**
   * Reloads listener files (only those that have been added from by file path)
   */
  reload () {
    this.destroy()
    for (const filepath of this._cached) {
      this._client.unload(filepath)
      this._cached.shift()
      this.register(filepath)
      this.run()
    }
    return this
  }

  /**
   * Fires when an error occurs in Router
   *
   * @event Client#router:error
   * @type {Error}
   */

  /**
   * Fires when an error occurs in Router's event handling
   *
   * @event Client#router:runError
   * @type {Error}
   */
}

module.exports = Router
