'use strict'

const later = require('later')

class Tasker {
  constructor (client, options = {}) {
    this._client = client

    this.tasks = []
  }

  register (tasks, options = {}) {
    switch (typeof tasks) {
      case 'string': {
        throw new Error('FINISH THIS, NUCKLEHEAD')
      }

      case 'object': {
        if (Array.isArray(tasks)) {
          for (const task of tasks) {
            this.attach(task, options)
          }
        }
        return this
      }

      default: {
        throw new Error('whoops')
      }
    }
  }

  attach (Task, options) {
    let task = typeof Task === 'function' ? new Task(options) : Task

    let name = task.name

    let interval = task.interval

    this.tasks.push(task)

    this._client.emit('tasker:registered', {
      name: name,
      interval: interval,
      count: this.size
    })
  }

  run () {
    for (const task of this.tasks) {
      setInterval(task.run.bind(task), task.interval, this._client)
    }
  }
}

module.exports = Tasker
