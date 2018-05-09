'use strict'

const R = require('ramda')

const ModerationUtils = require('../util')

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

const forgiveSortFunc = (warnings, guildId) => R.compose(
  R.sortBy(R.prop('timestamp')),
  R.filter(R.propEq('guildId', guildId))
)(warnings)

class PunishService {
  static get banResults () { return banResults }

  static get kickResults () { return kickResults }

  static get warnResults () { return warnResults }

  static get forgiveResults () { return forgiveResults }

  static ban (client, mod, member, reason, sendDM = true, isCommand = true) {
    let warnReason = `**USER BANNED**\n${reason}`
    let guild = member.guild

    return this.warn(client, mod, member, warnReason, false, false)
      .then(() => {
        if (sendDM) {
          return member.user.getDMChannel()
            .then(dmChannel => {
              let embed = ModerationUtils.createBanMsgEmbed(guild, reason)
              return dmChannel.createMessage({ embed })
            })
        }
      })
      // .then(() => member.ban(0, reason))
      .return(this.banResults.SUCCESS)
  }

  static kick (client, mod, member, reason, sendDM = true, isCommand = true) {
    let warnReason = `**USER KICKED**\n${reason}`
    let guild = member.guild

    return this.warn(client, mod, member, warnReason, false, false)
      .then(() => {
        if (sendDM) {
          return member.user.getDMChannel()
            .then(dmChannel => {
              let embed = ModerationUtils.createKickMsgEmbed(guild, reason)
              return dmChannel.createMessage({ embed })
            })
        }
      })
      // .then(() => member.kick(reason))
      .return(this.kickResults.SUCCESS)
  }

  static async warn (client, mod, member, reason, sendDM = true, isCommand = true) {
    if (member.bot) {
      return Promise.reject(this.warnResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id

    return client.db.User.findOneOrCreate({ userId }, { userId },
      { populate: 'warnings' })
      .then(dbUser => {
        return client.db.Warning.create({
          user: dbUser._id,
          userId,
          guildId,
          reason,
          timestamp: new Date(),
          moderatorId: mod.id
        })
          .then(() => {
            let guildWarnings = R.filter(
              R.propEq('guildId', guildId), dbUser.warnings || [])

            let unforgivenWarnings = R.filter(R.propEq('forgiven', false), guildWarnings)

            let warnCount = guildWarnings.length + 1

            let p = Promise.resolve({
              code: this.warnResults.SUCCESS.errCode,
              count: warnCount,
              unforgiven: unforgivenWarnings.length + 1
            })

            if (sendDM) {
              return member.user.getDMChannel()
                .then(pmChannel => {
                  let embed = ModerationUtils.createWarningEmbed(
                    member.guild, member, unforgivenWarnings.length + 1, reason)
                  return pmChannel.createMessage({ embed })
                })
                .then(() => p)
            }

            return p
          })
      })
  }

  static forgive (client, mod, member, num) {
    if (member.bot) {
      return Promise.reject(this.forgiveResults.ERROR_IS_BOT)
    }

    let guildId = member.guild.id
    let userId = member.id

    return client.db.User.findOneOrCreate({ userId }, { userId },
      { populate: 'warnings' })
      .then(dbUser => {
        let guildWarnings = forgiveSortFunc(dbUser.warnings, guildId)
        let warning = guildWarnings[num]

        if (!warning) {
          return Promise.reject(this.forgiveResults.ERROR_WARN_NOT_EXIST)
        }

        if (warning.forgiven) {
          return Promise.reject(this.forgiveResults.ERROR_ALREADY_FORGIVEN)
        }

        warning.forgiven = true
        return warning.save()
          .then(() => Promise.resolve({
            code: this.forgiveResults.SUCCESS.errCode,
            reason: warning.reason
          }))
      })
  }
}

module.exports = PunishService
