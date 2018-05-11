'use strict'

const { Command } = require.main.require('./sylphy')

class DogCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'dog',
      description: 'Get a random dog image',
      cooldown: 15
    })
  }

  async handle ({ msg, client }, responder) {
    return client.api.dogs.getDogs()
      .then(data => {
        return responder.send(data.data[0].url)
      })
  }
}

module.exports = DogCommand
