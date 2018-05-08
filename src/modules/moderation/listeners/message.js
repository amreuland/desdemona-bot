'use strict'

const moment = require('moment')

const { Listener } = require('sylphy')

class CopycatListener extends Listener {
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

    let guildId = msg.channel.guild.id
    let userId = msg.author.id

    let modCache = this._client.cache.mod
    let gagDB = this._client.db.Gag

    let cacheKey = `gags:${guildId}:${userId}`

    return modCache.get(cacheKey)
      .then(data => {
        if (!data) {
          return gagDB.findOne({ guildId, userId })
            .then(dbItem => {
              if (!dbItem) {
                return false
              }

              if (!dbItem.timeout) {
                return modCache.set(cacheKey, 1)
                  .return(true)
              }

              let diff = moment().diff(dbItem.timeout, 'seconds')
              if (diff >= 0) {
                return dbItem.remove()
                  .then(() => modCache.del(cacheKey))
                  .return(false)
              }

              diff = Math.abs(diff)
              return modCache.set(cacheKey, 1, 'EX', diff).return(true)
            })
        }
        return data
      })
      .then(data => {
        if (!data) {
          return false
        }

        return msg.delete('User gagged')
      })
  }
}

module.exports = CopycatListener
