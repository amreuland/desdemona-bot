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

class SilenceService {
  static get silenceResults () { return silenceResults }

  static get unsilenceResults () { return unsilenceResults }

  static silence (client, member, time) {
    if (member.bot) {
      return Promise.reject(this.silenceResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id
    let timeout = time ? moment().add(time, 's').toDate() : 0

    return Promise.all([
      client.db.User.findOneOrCreate({ userId }, { userId }),
      client.db.Guild.findOneOrCreate({ guildId }, { guildId }),
      client.db.Gag.findOne({ guildId, userId })
    ])
      .then(([dbUser, dbGuild, dbGag]) => {
        if (!dbGag) {
          return client.db.Gag.create({
            user: dbUser._id,
            guild: dbGuild._id,
            userId,
            guildId,
            timeout
          }).then(() => this.silenceResults.SUCCESS)
        }

        return Promise.reject(this.silenceResults.ERROR_ALREADY_SILENCED)
      })
  }

  static unsilence (client, member) {
    if (member.bot) {
      return Promise.reject(this.unsilenceResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id

    return client.cache.mod.del(`gags:${guildId}:${userId}`)
      .then(() => client.db.Gag.findOne({ guildId, userId }))
      .then(dbGag => {
        if (!dbGag) {
          return Promise.reject(this.unsilenceResults.ERROR_NOT_SILENCED)
        }

        return dbGag.remove()
          .then(() => this.unsilenceResults.SUCCESS)
      })
  }
}

module.exports = SilenceService
