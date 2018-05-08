'use strict'

const moment = require('moment')

const warningFormat = ts => moment(ts).format('ddd, MMM DD YYYY, HH:mm')

class ModerationUtils {
  static createBanMsgEmbed (guild, reason) {
    let fields = [
      {
        name: 'Reason',
        value: reason
      }
    ]

    return {
      title: 'Ban Notice',
      author: {
        name: guild.name,
        icon_url: guild.iconURL
      },
      description: ':warning:**You have been banned from the server**',
      fields,
      color: 0xe63a00,
      footer: {
        text: 'Ban Notice'
      },
      timestamp: new Date()
    }
  }

  static createKickMsgEmbed (guild, reason) {
    let fields = [
      {
        name: 'Reason',
        value: reason
      }
    ]

    return {
      title: 'Kick Notice',
      author: {
        name: guild.name,
        icon_url: guild.iconURL
      },
      description: ':warning:**You have been kicked from the server**',
      fields,
      color: 0xe63a00,
      footer: {
        text: 'Kick Notice'
      },
      timestamp: new Date()
    }
  }

  static createWarnlogEmbed (member, warnings, owc) {
    let fields = []

    let idx = 0
    warnings.forEach(warning => {
      idx++
      fields.push({
        name: `#${idx} on ${warningFormat(warning.timestamp)}${warning.forgiven ? ' (forgiven)' : ''}`,
        value: warning.reason
      })
    })

    let name = `${member.username}#${member.discriminator}`

    let description = [
      `**${name}** joined on **${warningFormat(member.joinedAt)}**`,
      `They have **${warnings.length}** ${warnings.length > 1 ? 'total warnings' : 'warning'} on this server.`
    ]

    if (owc > 0) {
      description.push(`In addition, they have ${owc} unforgiven warning${owc > 1 ? 's' : ''} in other servers.`)
    }

    description = description.join('\n')

    return {
      title: `Warning log for ${name}`,
      description,
      thumbnail: {
        url: member.avatarURL,
        width: 128,
        height: 128
      },
      fields,
      footer: {
        text: 'Warning Log'
      },
      timestamp: new Date(),
      color: 0xffcc00
    }
  }

  static createWarningEmbed (guild, moderator, warnCount, reason) {
    let fields = [
      {
        name: 'Reason',
        value: reason
      }
    ]

    if (warnCount > 1) {
      fields.push({
        name: 'Total Warnings',
        value: warnCount
      })
    }

    return {
      title: 'Warning Notice',
      author: {
        name: guild.name,
        icon_url: guild.iconURL
      },
      description: ':warning:**You have recieved a warning**',
      fields,
      color: 0xffcc00,
      footer: {
        text: 'Warning Message'
      },
      timestamp: new Date()
    }
  }
}

module.exports = ModerationUtils
