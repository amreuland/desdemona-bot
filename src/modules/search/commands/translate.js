'use strict'

const translate = require('google-translate-api')

const { Command } = require('sylphy')

class TranslateCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'translate',
      description: 'Search youtube and return the first result',
      aliases: ['tl'],
      cooldown: 30,
      usage: [
        { name: 'fromTo', displayName: 'from>to', type: 'string' },
        { name: 'message', displayName: 'message', type: 'string', last: true }
      ],
      options: {
        guildOnly: true
      },
      examples: [
        {
          args: 'nl>en Ik spreek Engels',
          description: 'Translate \'Ik spreek Engels\' to english from dutch'
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    if (msg.author.bot) {
      return false
    }

    let fromTo = args.fromTo.match(/^(\w+)>(\w+)$/)
    if (!fromTo[1] || !fromTo[2]) {
      responder.error('I did not recoognize that from-to format')
      return false
    }

    let message = args.message

    return translate(message, {from: fromTo[1], to: fromTo[2]})
      .then(results => {
        if (!results.text) {
          return responder.error('An error occured')
        }

        return responder.send(results.text)
      })
  }
}

module.exports = TranslateCommand
