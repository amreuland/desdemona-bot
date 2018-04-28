'use strict'

const moment = require('moment')

class CopycatUtils {
  static createMirrorEmbed (msg) {
    let description = `**Posted in ${msg.channel.mention}**\n\n${msg.content}\n\n**End Message**`
    let author = {
      name: `${msg.author.username}#${msg.author.discriminator}`,
      icon_url: msg.author.avatarURL
    }

    let title = `Posted in ${msg.channel.mention}`

    let footer = {
      text: `User ID: ${msg.author.id}`
    }

    let timestamp = moment(msg.timestamp).toDate()

    let color = 0xff8300

    return {
      description,
      timestamp,
      color,
      footer,
      author
    }
  }
}

module.exports = CopycatUtils
