const Base = require('./Base')

/**
 * Built-in listener class
 * @extends {Base}
 * @abstract
 */
class Listener extends Base {
  constructor (client, options) {
    super(client)
    if (this.constructor === Listener) {
      throw new Error('Must extend abstract Listener')
    }

    this.options = options
  }

  /** Initialises the listener */
  init () {}

  /** Unloads the listener */
  unload () {}

  /**
   * Verifies the options passed to the constructor
   * @arg {Object} args Options passed to the Command constructor
   * @private
   */
  set options ({ name, events = {}, localeKey } = {}) {
    if (typeof name === 'undefined') throw new Error(`${this.constructor.name} is not named`)
    if (typeof events !== 'object') throw new Error('Listener event must be an object')

    for (const event in events) {
      if (typeof event !== 'string') {
        throw new TypeError(`Listener ${name} has an invalid event`)
      }

      if (typeof this[events[event]] !== 'function') {
        throw new TypeError(`Listener ${name} has an invalid handler`)
      }
    }

    this.name = name
    this.events = events
    this.localeKey = localeKey
  }
}

module.exports = Listener
