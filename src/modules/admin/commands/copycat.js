'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

class CopycatCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'copycat',
      aliases: ['mirror'],
      description: 'Manage Navi copycat module',
      usage: [
        {
          name: 'subcmd',
          choices: [ 'link', 'unlink', 'unlinkall', 'list' ],
          type: 'string'
        }
      ],
      options: {
        guildOnly: true,
        permissions: ['administrator'],
        hidden: false
      },
      examples: [
        {
          args: 'link #general #general-mirror',
          description: 'Link #genearl-mirror to #general'
        }
      ],
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
        unlinkall: {
          aliases: ['removeall', 'deleteall'],
          options: {
            guildOnly: true,
            permissions: ['administrator']
          },
          usage: [
            { name: 'channel', displayName: 'channel', type: 'channel', optional: true }
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
      return responder.error('{{copycat.errors.SAME_CHANNEL}}')
    }

    let search = {guildId, channelId: srcCh.id}
    return client.db.Copycat.findOne(search)
      .then(dbItem => (!dbItem ? (new client.db.Copycat(search)) : dbItem))
      .then(dbItem => {
        if (R.indexOf(destCh.id, dbItem.targets) !== -1) {
          let err = {
            isMessage: true,
            message: 'errors.LINK_EXISTS',
            src: srcCh.mention,
            dest: destCh.mention
          }
          return Promise.reject(err)
        }

        dbItem.targets.push(destCh.id)
        return dbItem.save()
      })
      .then(() => {
        return client.cache.copycat.sadd(`channel:${srcCh.id}`, destCh.id)
          .then(() => client.cache.copycat.expire(`channel:${srcCh.id}`, 3600))
      })
      .then(() => client.cache.copycat.del(`flag:${guildId}`))
      .then(() => {
        return responder.success('{{copycat.success.CHANNELS_LINKED}}', {
          src: srcCh.mention,
          dest: destCh.mention
        })
      })
      .catch({isMessage: true}, err => responder.error(`{{copycat.${err.message}}}`, err))
      .catch(err => client.raven.captureException(err))
  }

  async unlink ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    let srcCh = args.srcChannel[0]
    let destCh = args.destChannel[0]

    if (srcCh.id === destCh.id) {
      return responder.error('{{copycat.errors.SAME_CHANNEL}}')
    }

    let search = {guildId, channelId: srcCh.id}
    return client.db.Copycat.findOne(search)
      .then(dbItem => {
        if (!dbItem || R.indexOf(destCh.id, dbItem.targets) === -1) {
          let err = {
            isMessage: true,
            message: 'errors.LINK_NOT_EXIST',
            src: srcCh.name,
            dest: destCh.name
          }
          return Promise.reject(err)
        }

        return dbItem
      })
      .then(dbItem => {
        let newTargets = R.difference([destCh.id], dbItem.targets)
        dbItem.targets = newTargets
        return dbItem.save()
      })
      .then(() => client.cache.copycat.srem(`channel:${srcCh.id}`, destCh.id))
      .then(() => {
        return responder.success('{{copycat.success.CHANNELS_UNLINKED}}', {
          src: srcCh.mention,
          dest: destCh.mention
        })
      })
      .catch({isMessage: true}, err => responder.error(`{{copycat.${err.message}}}`, err))
      .catch(err => client.raven.captureException(err))
  }

  async unlinkall ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    let search = { guildId }
    let channel = null
    if (args.channel && args.channel[0]) {
      channel = args.channel[0]
      search.channelId = channel.id
    }

    let question = `Are you sure you want to unlink all mirrors from ${
      !channel ? 'the guild' : `#${channel.name}`
    }?`

    let selection = await responder.selection(['Yes', 'No'], {
      title: question
    })

    if (selection[0] !== 'Yes') {
      return false
    }

    return Promise.map(client.db.Copycat.find(search), dbItem => {
      let total = dbItem.targets.length
      dbItem.targets = []
      return dbItem.save()
        .then(() => client.cache.copycat.del(`channel:${dbItem.channelId}`))
        .return(total)
    })
      .then(() => {
        if (channel) {
          return responder.success('{{copycat.success.CHANNELS_UNLINKED_BULK_CHANNEL}}', {
            src: channel.mention
          })
        }
        return responder.success('{{copycat.success.CHANNELS_UNLINKED_BULK_GUILD}}')
      })
      .catch({isMessage: true}, err => responder.error(`{{copycat.${err.message}}}`, err))
      .catch(err => client.raven.captureException(err))
  }

  async list ({ msg, client, args }, responder) {
    let guildId = msg.channel.guild.id

    let search = { guildId }
    let channel = null
    if (args.channel && args.channel[0]) {
      channel = args.channel[0]
      search.channelId = channel.id
    }

    let reply = [
      `Here are the mirror links for **${!channel ? 'the guild' : channel.mention}**`,
      '**```glsl'
    ]

    return Promise.map(client.db.Copycat.find(search), dbItem => {
      let sourceCh = msg.channel.guild.channels.get(dbItem.channelId)
      let targets = R.map(target => {
        let targetCh = msg.channel.guild.channels.get(target)
        return targetCh ? targetCh.name : `deleted-channel (${target})`
      }, dbItem.targets)

      return {
        source: sourceCh ? sourceCh.name : null,
        targets
      }
    })
      .each(listing => {
        if (!listing.source) return
        if (!listing.targets.length) return
        reply.push(`#${listing.source}:\n${listing.targets.map(t => `\t-> #${t}`).join('\n')}`)
      })
      .then(() => {
        reply.push('```**')

        if (reply.length === 3) {
          return responder.error(`there are no mirror links for ${!channel ? 'the guild' : channel.mention}`)
        }

        return responder.send(reply.join('\n'))
      })
      .catch(err => client.raven.captureException(err))
  }
}

module.exports = CopycatCommand
