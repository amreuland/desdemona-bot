'use strict'

const { Command } = require.main.require('./sylphy')

class CatCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'cat',
      description: 'Get a random cat image',
      cooldown: 15
    })
  }

  async handle ({ msg, client }, responder) {
    return client.api.cats.getCats()
      .then(data => {
        return responder.send(data.response.data.images.image[0].url)
      })
  }
}

module.exports = CatCommand
