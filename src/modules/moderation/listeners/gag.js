'use strict'

const { Listener } = require('sylphy')

const { SilenceService } = require('../services')

class GagListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'moderation:gag:logic',
      events: {
        messageCreate: 'onMessageCreate'
      }
    })
  }

  onMessageCreate (msg) {
    if (!msg.channel.guild) {
      return
    }

    if (msg.author.bot) {
      return
    }

    let member = msg.member

    return SilenceService.isMemberSilenced(this._client, member)
      .then(data => {
        if (!data) {
          return false
        }

        return msg.delete('User gagged')
      })
  }
}

module.exports = GagListener
