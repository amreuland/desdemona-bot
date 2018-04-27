'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

class CopycatCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'copycat',
      aliases: ['mirror'],
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
            { name: 'srcChannel', displayName: 'source', type: 'channel', text: true },
            { name: 'destChannel', displayName: 'destination', type: 'channel', text: true }
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

    let srcCh = args.srcChannel[0]
    let destCh = args.destChannel[0]

    if (srcCh.id === destCh.id) {
      return responder.error('{{%copycat.errors.SAME_CHANNEL}}')
    }

    let search = {guildId, channelId: srcCh.id}
    return client.db.Copycat.findOne(search)
      .then(dbItem => (!dbItem ? (new client.db.Copycat(search)) : dbItem))
      .then(dbItem => {
        if (R.indexOf(destCh.id, dbItem.targets) !== -1) {
          let err = {
            isMessage: true,
            message: 'errors.LINK_EXISTS',
            src: srcCh.name,
            dest: destCh.name
          }
          return Promise.reject(err)
        }

        dbItem.targets.push(destCh.id)
        return dbItem.save()
      })
      .then(() => {
        return client.cache.copycat.sadd(`copycat:channel:${srcCh.id}`, destCh.id)
          .then(() => client.cache.copycat.expire(`copycat:channel:${srcCh.id}`, 3600))
      })
      .then(() => client.cache.copycat.del(`copycat:flag:${guildId}`))
      .then(() => {
        return responder.success('{{%copycat.success.CHANNELS_LINKED}}', {
          src: srcCh.name,
          dest: destCh.name
        })
      })
      .catch({isMessage: true}, err => responder.error(`{{%copycat.${err.message}}}`, err))
      .catch(err => client.raven.captureException(err))
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
