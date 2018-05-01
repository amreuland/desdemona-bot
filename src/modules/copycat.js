'use strict'

const R = require('ramda')

const { Module } = require('sylphy')

const { CopycatUtils } = require('../util')

class CopycatModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'copycat:logic',
      events: {
        messageCreate: 'onMessageCreate',
        messageDelete: 'onMessageDelete',
        messageUpdate: 'onMessageUpdate'
      }
    })
  }

  onMessageCreate (message) {
    if (!message.channel.guild) {
      return
    }

    let channelId = message.channel.id
    let guildId = message.channel.guild.id
    let messageId = message.id

    let copyCache = this._client.cache.copycat

    if (message.author.bot) {
      return false
    }

    return copyCache.smembers(`channel:${channelId}`)
      .then(data => {
        if (!data || !data.length) {
          return copyCache.get(`flag:${guildId}`)
            .then(flag => {
              if (flag) {
                return null
              }

              return this._client.db.Copycat.findOne({guildId, channelId})
                .then(dbItem => {
                  if (!dbItem || !dbItem.targets.length) {
                    return copyCache.set(`flag:${guildId}`, 1, 'EX', 3600)
                      .return(null)
                  }

                  let items = dbItem.targets
                  return copyCache.sadd(`channel:${channelId}`, ...items)
                    .then(() => copyCache.expire(`channel:${channelId}`, 3600))
                    .return(items)
                })
            })
        }

        return data
      })
      .then(data => {
        if (!data || !data.length) {
          return
        }

        let embed = CopycatUtils.createMirrorEmbed(message)

        return Promise.map(data, destinationId => {
          return this._client.createMessage(destinationId, { embed })
            .then(newMsg => {
              return copyCache.sadd(`message:${messageId}`, `${destinationId}:${newMsg.id}`)
            })
        }).then(() => {
          return copyCache.expire(`message:${messageId}`, 7200)
        })
      })
      .catch(err => this._client.raven.captureException(err))
  }

  onMessageDelete (message) {
    if (!message.channel.guild) {
      return
    }

    let messageId = message.id

    let copyCache = this._client.cache.copycat

    let p = {
      name: 'Deleted At',
      value: `${new Date()}`
    }

    return Promise.map(copyCache.smembers(`message:${messageId}`), mirrorStr => {
      let [mirrorChId, mirrorMsgId] = R.split(':', mirrorStr)
      return this._client.getMessage(mirrorChId, mirrorMsgId)
        .then(mirrorMsg => {
          let embed = mirrorMsg.embeds[0]
          embed.fields.push(p)

          return this._client.editMessage(mirrorChId, mirrorMsgId, { embed })
        })
    })
      .then(() => copyCache.del(`message:${messageId}`))
      .catch(err => this._client.raven.captureException(err))
  }

  onMessageUpdate (message, OldMessage) {
    if (!message.channel.guild) {
      return
    }

    let messageId = message.id

    let copyCache = this._client.cache.copycat

    let content = CopycatUtils.sanitizeMentions(message)

    let p = {
      name: `Edited at ${new Date()}`,
      value: (content === '' ? '*Empty*' : content)
    }

    return Promise.map(copyCache.smembers(`message:${messageId}`), mirrorStr => {
      let [mirrorChId, mirrorMsgId] = R.split(':', mirrorStr)
      return this._client.getMessage(mirrorChId, mirrorMsgId)
        .then(mirrorMsg => {
          let embed = mirrorMsg.embeds[0]
          embed.fields.push(p)

          return this._client.editMessage(mirrorChId, mirrorMsgId, { embed })
        })
    }).catch(err => this._client.raven.captureException(err))
  }
}

module.exports = CopycatModule
