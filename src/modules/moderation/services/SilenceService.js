'use strict'

const moment = require('moment')

const silenceResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_IS_BOT: {code: 'ERROR_IS_BOT'},
  ERROR_ALREADY_SILENCED: {code: 'ERROR_ALREADY_SILENCED'}
})

const unsilenceResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_IS_BOT: {code: 'ERROR_IS_BOT'},
  ERROR_NOT_SILENCED: {code: 'ERROR_NOT_SILENCED'}
})

const lockResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_ALREADY_LOCKED: {code: 'ERROR_ALREADY_LOCKED'}
})

const unlockResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_NOT_LOCKED: {code: 'ERROR_NOT_LOCKED'}
})

class SilenceService {
  static get silenceResults () { return silenceResults }

  static get unsilenceResults () { return unsilenceResults }

  static get lockResults () { return lockResults }

  static get unlockResults () { return unlockResults }

  static silence (client, member, time) {
    if (member.bot) {
      return Promise.reject(this.silenceResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id
    let timeout = time ? moment().add(time, 's').toDate() : 0

    return client.db.Gag.findOne({ guildId, userId })
      .then(dbGag => {
        if (dbGag) {
          return Promise.reject(this.silenceResults.ERROR_ALREADY_SILENCED)
        }
        return client.db.Gag.create({ userId, guildId, timeout })
      })
      .then(() => this.silenceResults.SUCCESS)
  }

  static unsilence (client, member) {
    if (member.bot) {
      return Promise.reject(this.unsilenceResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id

    return client.cache.mod.del(`silence:${guildId}:member:${userId}`)
      .then(() => client.db.Gag.findOne({ guildId, userId }))
      .then(dbGag => {
        if (!dbGag) {
          return Promise.reject(this.unsilenceResults.ERROR_NOT_SILENCED)
        }
        return dbGag.remove()
      })
      .then(() => this.unsilenceResults.SUCCESS)
  }

  static _isItemSilenced (client, cacheKey, search) {
    let modCache = client.cache.mod
    let gagDB = client.db.Gag

    return modCache.get(cacheKey)
      .then(data => {
        if (!data) {
          return gagDB.findOne(search)
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
  }

  static lockChannel (client, channel, time) {
    let guildId = channel.guild.id
    let channelId = channel.id
    let timeout = time ? moment().add(time, 's').toDate() : 0

    return client.db.Gag.findOne({ guildId, channelId })
      .then(dbGag => {
        if (dbGag) {
          return Promise.reject(this.lockResults.ERROR_ALREADY_LOCKED)
        }
        return client.db.Gag.create({ channelId, guildId, timeout })
      })
      .then(() => this.lockResults.SUCCESS)
  }

  static unlockChannel (client, channel) {
    let guildId = channel.guild.id
    let channelId = channel.id

    return client.cache.mod.del(`silence:${guildId}:channel:${channelId}`)
      .then(() => client.db.Gag.findOne({ guildId, channelId }))
      .then(dbGag => {
        if (!dbGag) {
          return Promise.reject(this.unlockResults.ERROR_NOT_LOCKED)
        }

        return dbGag.remove()
      })
      .then(() => this.unlockResults.SUCCESS)
  }

  static isMemberSilenced (client, member) {
    let userId = member.id
    let guildId = member.guild.id

    let cacheKey = `silence:${guildId}:member:${userId}`
    let search = { guildId, userId }

    return this._isItemSilenced(client, cacheKey, search)
  }

  static isChannelInLockdown (client, channel) {
    let channelId = channel.id
    let guildId = channel.guild.id

    let cacheKey = `silence:${guildId}:channel:${channelId}`
    let search = { guildId, channelId }

    return this._isItemSilenced(client, cacheKey, search)
  }
}

module.exports = SilenceService
