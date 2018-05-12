'use strict'

const { Command } = require.main.require('./sylphy')

const { createUrbanDictEmbed } = require('../util')

class UrbanDictionarySearchCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'ud',
      description: 'Search urban dictionary and return the first three results',
      aliases: ['urbandictionary', 'urbandict'],
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
          description: 'Search Urban Dictionary for \'Radioactive\''
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    if (msg.author.bot) {
      return false
    }

    let search = args.search

    return client.api.urbandict.lookupTerm(search)
      .then(results => {
        if (results.result_type === 'no_results') {
          return responder.error(`no results found for **${search}**`)
        }

        let embed = createUrbanDictEmbed(search, results.list)

        return msg.channel.createMessage({ embed })
      })
  }
}

module.exports = UrbanDictionarySearchCommand
