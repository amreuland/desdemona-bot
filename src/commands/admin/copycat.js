'use strict'

const { Command } = require('sylphy')

class CopycatCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'copycat',
      group: 'admin',
      description: 'Manage Navi copycat module',
      options: {
        guildOnly: true,
        permissions: ['administrator'],
        hidden: false
      },
      subcommands: {
        link: {
          aliases: ['add'],
          options: {
            guildOnly: true,
            permissions: ['administrator']
          },
          usage: [
            { name: 'srcChannel', displayName: 'source', type: 'channel' },
            { name: 'destChannel', displayName: 'destination', type: 'channel' }
          ]
        },
        unlink: {
          aliases: ['remove', 'delete'],
          options: {
            guildOnly: true,
            permissions: ['administrator']
          },
          usage: [
            { name: 'srcChannel', displayName: 'source', type: 'channel' },
            { name: 'destChannel', displayName: 'destination', type: 'channel' }
          ]
        },
        list: {
          options: {
            guildOnly: true,
            permissions: ['administrator']
          },
          usage: [
            { name: 'channel', displayName: 'channel', type: 'channel', optional: true }
          ]
        }
      }
    })
  }

  async handle ({ msg, client, args }, responder) {

  }

  async link ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    let srcCh = args.srcChannel
    let destCh = args.destChannel

    if (srcCh.id === destCh.id) {
      return responder.error('{{%copycat.errors.SAME_CHANNEL}}')
    }
  }

  async unlink ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    let srcCh = args.srcChannel
    let destCh = args.destChannel

    if (srcCh.id === destCh.id) {
      return responder.error('{{%copycat.errors.SAME_CHANNEL}}')
    }
  }

  async unlinkAll ({ msg, client, args }, responder) {

  }

  async list ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    let ch = args.channel[0]
  }
}

module.exports = CopycatCommand
