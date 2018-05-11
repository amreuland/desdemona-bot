'use strict'

const { SilenceService } = require('../services')

module.exports = {
  name: 'copycat',
  priority: 14,
  process: container => {
    const { msg, client, isPrivate } = container

    if (isPrivate) {
      return Promise.resolve(container)
    }

    let member = msg.member

    return SilenceService.isMemberSilenced(client, member)
      .then(result => {
        if (!result) {
          return container
        }

        return msg.delete('User silenced').return(null)
      })
  }
}



  onMessageCreate (msg) {
    const { msg, client, isPrivate } = container

    let channelId = msg.channel.id
    let guildId = msg.channel.guild.id
    let messageId = msg.id

    let copyCache = client.cache.copycat

    if (msg.author.bot) {
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

              return client.db.Copycat.findOne({ guildId, channelId })
                .then(dbItem => {
                  if (!dbItem || !dbItem.targets.length) {
                    return copyCache.set(`flag:${guildId}`, 1, 'EX', 300)
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

        let embed = CopycatUtils.createMirrorEmbed(msg)

        return Promise.map(data, destinationId => {
          let ch = msg.channel.guild.channels.get(destinationId)
          if (!ch) {
            return copyCache.srem(`channel:${channelId}`, destinationId)
          }
          return client.createMessage(destinationId, { embed })
            .then(newMsg => {
              return copyCache.sadd(`message:${messageId}`, `${destinationId}:${newMsg.id}`)
            })
        })
          .then(() => {
            return copyCache.expire(`message:${messageId}`, 7200)
          })
      })
      .catch(err => client.raven.captureException(err))
  }
