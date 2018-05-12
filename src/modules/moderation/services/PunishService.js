'use strict'

const R = require('ramda')

const ModerationUtils = require('../util')

const { NaviService } = require.main.require('./lib')

const banResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'}
})

const kickResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'}
})

const warnResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_IS_BOT: {code: 'ERROR_IS_BOT'}
})

const forgiveResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_IS_BOT: {code: 'ERROR_IS_BOT'},
  ERROR_WARN_NOT_EXIST: {code: 'ERROR_WARN_NOT_EXIST'},
  ERROR_ALREADY_FORGIVEN: {code: 'ERROR_ALREADY_FORGIVEN'}
})

class PunishService extends NaviService {
  constructor (...args) {
    super(...args, {
      name: 'Punish'
    })
  }

  get banResults () { return banResults }

  get kickResults () { return kickResults }

  get warnResults () { return warnResults }

  get forgiveResults () { return forgiveResults }

  ban (mod, member, reason, sendDM = true, isCommand = true) {
    let warnReason = `**USER BANNED**\n${reason}`
    let guild = member.guild

    return this.warn(this.client, mod, member, warnReason, false, false)
      .then(() => {
        if (sendDM) {
          return member.user.getDMChannel()
            .then(dmChannel => {
              let embed = ModerationUtils.createBanMsgEmbed(guild, reason)
              return dmChannel.createMessage({ embed })
            })
        }
      })
      .then(() => member.ban(0, reason))
      .return(this.banResults.SUCCESS)
  }

  kick (mod, member, reason, sendDM = true, isCommand = true) {
    let warnReason = `**USER KICKED**\n${reason}`
    let guild = member.guild

    return this.warn(this.client, mod, member, warnReason, false, false)
      .then(() => {
        if (sendDM) {
          return member.user.getDMChannel()
            .then(dmChannel => {
              let embed = ModerationUtils.createKickMsgEmbed(guild, reason)
              return dmChannel.createMessage({ embed })
            })
        }
      })
      .then(() => member.kick(reason))
      .return(this.kickResults.SUCCESS)
  }

  async warn (mod, member, reason, sendDM = true, isCommand = true) {
    if (member.bot) {
      return Promise.reject(this.warnResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id

    return this.client.db.Warning.create({
      userId,
      guildId,
      reason,
      timestamp: new Date(),
      moderatorId: mod.id
    })
      .then(() => this.client.db.Warning.find({ userId, guildId }))
      .then(dbWarnings => {
        let unforgivenWarnings = R.filter(R.propEq('forgiven', false), dbWarnings)

        let p = Promise.resolve({
          code: this.warnResults.SUCCESS.code,
          count: dbWarnings.length,
          unforgiven: unforgivenWarnings.length
        })

        if (sendDM) {
          return member.user.getDMChannel()
            .then(pmChannel => {
              let embed = ModerationUtils.createWarningEmbed(
                member.guild, member, unforgivenWarnings.length, reason)
              return pmChannel.createMessage({ embed })
            })
            .then(() => p)
        }

        return p
      })
  }

  forgive (mod, member, num) {
    if (member.bot) {
      return Promise.reject(this.forgiveResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id

    return this.client.db.Warning.find({ userId, guildId })
      .sort({ timestamp: 'asc' })
      .skip(num)
      .limit(1)
      .then(dbWarning => {
        if (!dbWarning) {
          return Promise.reject(this.forgiveResults.ERROR_WARN_NOT_EXIST)
        }

        if (dbWarning.forgiven) {
          return Promise.reject(this.forgiveResults.ERROR_ALREADY_FORGIVEN)
        }

        dbWarning.forgiven = true
        return dbWarning.save()
          .then(() => Promise.resolve({
            code: this.forgiveResults.SUCCESS.code,
            reason: dbWarning.reason
          }))
      })
  }
}

module.exports = PunishService
