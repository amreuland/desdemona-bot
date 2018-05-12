let Promise
try {
  Promise = require('bluebird')
} catch (err) {
  Promise = global.Promise
}

const path = require('path')
const fs = require('fs')

const { requireRecursive, isDir } = require('../util')

/**
 * Middleware manager for commands
 * @prop {Array} tasks An array of middleware
 * @prop {Array} collectors An array of message collectors
 */
class Bridge {
  /**
   * Creates a new Bridge instance
   * @arg {Client} client Client instance
   */
  constructor (client) {
    this.tasks = []
    this.collectors = []
    this.reactors = []
    this._cached = []
    this._client = client
    this._commander = client.plugins.get('commands')
    if (!this._commander) {
      client.logger.warn('Commander plugin not found')
    }
  }

  /**
   * Registers middleware
   * @arg {String|Object|Array} middleware An object, array or relative path to a folder or file to load middleware from
   * @returns {Client}
   */
  register (middleware) {
    switch (typeof middleware) {
      case 'string': {
        const filepath = path.isAbsolute(middleware) ? middleware : path.join(process.cwd(), middleware)
        if (!fs.existsSync(filepath)) {
          throw new Error(`Folder path ${filepath} does not exist`)
        }
        this._cached.push(middleware)
        const mw = isDir(filepath) ? requireRecursive(filepath) : require(filepath)
        return this.register(mw)
      }
      case 'object': {
        if (Array.isArray(middleware)) {
          for (const mw of middleware) {
            this.push(mw)
          }
          return this
        }
        for (const key in middleware) {
          this.push(middleware[key])
        }
        return this
      }
      default: {
        throw new Error('Path supplied is not an object or string')
      }
    }
  }

  /**
   * Methods that parses messages and adds properties to a context container
   * @typedef {Object} Middleware
   * @prop {String} name Name of middleware
   * @prop {Number} priority Priority level of the middleware
   * @prop {Promise(Container)} process Middleware process
   */

  /**
   * Inserts new middleware to the task queue according to ascending priority (lower numbers are earlier in queue)
   * @arg {Middleware} middleware Middleware object
   */
  push (Middleware) {
    const middleware = typeof Middleware === 'function' ? new Middleware(this) : Middleware
    this.tasks.push(middleware)
    this.tasks.sort((a, b) => a.priority - b.priority)

    /**
     * Fires when a middleware is registered
     *
     * @event Client#bridge:registered
     * @type {Object}
     * @prop {String} name Middleware name
     * @prop {Number} index Location of middleware in the tasks chain
     * @prop {Number} count Number of loaded middleware tasks
     */
    this._client.emit('bridge:registered', {
      name: middleware.name,
      index: this.tasks.indexOf(middleware),
      count: this.tasks.length
    })
    return this
  }

  react (options = {}) {
    const { time = 10, messageId, channelId, userId, filter } = options

    const reactor = {
      _listening: false,
      _ended: false
    }

    const endFunc = () => {
      reactor._ended = {
        reason: 'timeout',
        arg: time
      }

      if (reactor._reject) {
        reactor._reject(reactor._ended)
      }
    }

    reactor._timer = time ? setTimeout(endFunc, time * 1000) : null

    reactor.stop = () => {
      reactor._listening = false
      if (this.reactors.includes(reactor)) {
        this.reactors.splice(this.reactors.indexOf(reactor), 1)
      }
    }

    reactor.reset = () => {
      reactor._listening = false
      if (time) {
        clearTimeout(reactor._timer)
        reactor._timer = setTimeout(endFunc, time * 1000)
      }
      reactor._ended = false
    }

    reactor.next = () => {
      return new Promise((resolve, reject) => {
        reactor._resolve = resolve
        reactor._reject = reject
        if (reactor._ended) {
          reactor.stop()
          reject(reactor._ended)
        }
        reactor._listening = true
      })
    }

    reactor.passEvent = event => {
      if (!reactor._listening) return false
      if (userId && userId !== event.userId) return false
      if (channelId && channelId !== event.msg.channel.id) return false
      if (messageId && messageId !== event.msg.id) return false

      let emoji = event.emoji.id ? `${event.emoji.name}:${event.emoji.id}` : event.emoji.name

      if (typeof filter === 'function' && !filter(emoji)) return false

      reactor._resolve(emoji)
      return true
    }
    this.reactors.push(reactor)
    return reactor
  }

  /**
   * Creates a message collector
   * @arg {Object} options Collector options
   * @arg {String} options.filter The filter function to pass all messages through
   * @arg {String} [options.channel] The channel ID to filter messages from
   * @arg {String} [options.author] The author ID to filter messages from
   * @arg {Number} [options.tries=10] Max number of attempts to filter a message
   * @arg {Number} [options.time=60] Max length of time to wait for messages, in seconds
   * @arg {Number} [options.matches=10] Max number of successful filtered messages
   * @returns {Collector} Message collector object
   */
  collect (options = {}) {
    const { tries = 10, time = 60, matches = 10, channel, author, filter } = options

    /**
     * Message collector object, intended for menus
     * @namespace Collector
     * @type {Object}
     */
    const collector = {
      /**
       * An array of collected messages
       * @memberof Collector
       * @type {Array}
       */
      collected: [],
      _tries: 0,
      _matches: 0,
      _listening: false,
      _ended: false,
      _timer: time ? setTimeout(() => {
        collector._ended = {
          reason: 'timeout',
          arg: time,
          collected: collector.collected
        }
      }, time * 1000) : null
    }
    /**
     * Stop collecting messages
     * @memberof Collector
     * @method
     */
    collector.stop = () => {
      collector._listening = false
      this.collectors.splice(this.collectors.indexOf(collector), 1)
    }
    /**
     * Resolves when message is collected, and rejects when collector has ended
     * @memberof Collector
     * @returns {Promise<external:"Eris.Message">}
     */
    collector.next = () => {
      return new Promise((resolve, reject) => {
        collector._resolve = resolve
        if (collector._ended) {
          collector.stop()
          reject(collector._ended)
        }
        collector._listening = true
      })
    }
    /**
     * Pass a message object to be filtered
     * @memberof Collector
     * @method
     * @returns {Boolean}
     */
    collector.passMessage = msg => {
      if (!collector._listening) return false
      if (author && author !== msg.author.id) return false
      if (channel && channel !== msg.channel.id) return false
      if (typeof filter === 'function' && !filter(msg)) return false

      collector.collected.push(msg)
      if (collector.collected.size >= matches) {
        collector._ended = { reason: 'maxMatches', arg: matches }
      } else if (tries && collector.collected.size === tries) {
        collector._ended = { reason: 'max', arg: tries }
      }
      collector._resolve(msg)
      return true
    }
    this.collectors.push(collector)
    return collector
  }

  /**
   * Destroy all tasks and collectors
   */
  destroy () {
    this.tasks = []
    this.collectors = []
  }

  /**
   * Remove middleware by name and returns it if found
   * @arg {String|Boolean} name Middleware name, will remove all if true
   * @returns {?Middleware}
   */
  unregister (name) {
    if (name === true) {
      return this.tasks.splice(0)
    }
    const middleware = this.tasks.find(mw => mw.name === name)
    if (!middleware) return null
    this.tasks.splice(this.tasks.indexOf(middleware, 1))
    return middleware
  }

  /**
   * Reloads middleware files (only those that have been added from by file path)
   */
  reload () {
    for (const filepath of this._cached) {
      this._client.unload(filepath)
      this._cached.shift()
      this.register(filepath)
    }
    return this
  }

  /** Starts running the bridge */
  run () {
    this._client.on('messageCreate', this.onMessageCreateEvent.bind(this))
    this._client.on('messageReactionAdd', this.onMessageReactionEvent.bind(this))
    this._client.on('messageReactionRemove', this.onMessageReactionEvent.bind(this))
  }

  onMessageCreateEvent (msg) {
    if (this._client.selfbot) {
      if (msg.author.id !== this._client.user.id) return
    } else {
      if (msg.author.id === this._client.user.id || msg.author.bot) return
    }

    this.handleMessage({
      msg: msg,
      client: this._client,
      logger: this._client.logger,
      admins: this._client.admins,
      commands: this._commander,
      listeners: this._client.plugins.get('listeners'),
      plugins: this._client.plugins,
      middleware: this
    }).catch(err => {
      if (err && this._client.logger) {
        this._client.thowOrEmit('bridge:error', err)
        // this._client.logger.error('Failed to handle message in Bridge -', err)
      }
    })
  }

  onMessageReactionEvent (msg, emoji, userId) {
    this.handleReaction({
      msg,
      client: this._client,
      logger: this._client.logger,
      emoji,
      userId,
      middleware: this
    }).catch(err => {
      if (err && this._client.logger) {
        this._client.thowOrEmit('bridge:error', err)
        // this._client.logger.error('Failed to handle reaction in Bridge -', err)
      }
    })
  }

  /** Stops running the bridge */
  stop () {
    this._client.removeAllListeners('messageCreate')
    this._client.removeAllListeners('messageReactionAdd')
    this._client.removeAllListeners('messageReactionRemove')
  }

  /**
   * Context container holding a message object along with added properties and objects
   * @typedef {Object} Container
   * @prop {external:"Eris.Message"} msg The message object
   * @prop {Client} client The client object
   * @prop {String} trigger The command trigger<br />
   * At least one middleware should add this into the container; default middleware does it for you
   */

  /**
   * Collects and executes messages after running them through middleware
   * @arg {Container} container The message container
   * @returns {Promise<Container>}
   */
  async handleMessage (container) {
    const { msg } = container
    for (let collector of this.collectors) {
      const collected = collector.passMessage(msg)
      if (collected) return Promise.reject()
    }
    for (const task of this.tasks) {
      const result = await task.process(container)
      if (!result) return Promise.reject()
      container = result
    }
    if (!container.trigger) return Promise.reject()
    this._commander.execute(container.trigger, container)
    return container
  }

  async handleReaction (event) {
    for (let reactor of this.reactors) {
      const reacted = reactor.passEvent(event)
      if (reacted) return Promise.reject()
    }
    return event
  }
}

module.exports = Bridge
