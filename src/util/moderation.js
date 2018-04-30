'use strict'

class ModerationUtils {
  static createWarningEmbed (guild, moderator, warnCount, reason) {
    let fields = [
      {
        name: 'Reason',
        value: reason
      },
      {
        name: 'Total Warnings',
        value: warnCount
      }
    ]

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
