'use strict'

const { Command } = require('sylphy')

class GoogleSearchCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'google',
      description: 'Search google and return the first three result',
      aliases: ['ggle'],
      cooldown: 30,
      usage: [
        { name: 'search', displayName: 'search-string', type: 'string', last: true }
      ],
      options: {
        guildOnly: true
      },
      examples: [
        {
          args: 'Radioactive',
          description: 'Search google for \'Radioactive\''
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    if (msg.author.bot) {
      return false
    }

    let search = args.search

    return client.api.google.getGoogleSearch(search)
      .then(results => {
        console.log(results)
      })
  }
}

module.exports = GoogleSearchCommand
