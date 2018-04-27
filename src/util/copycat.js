'use strict'

class CopycatUtils {

  static createMirrorEmbed (msg) {
    let description = msg.content
    let title =
    if (msg.member.nick) {

    }
    return {
      content: msg.content,
      nick: msg.member.nick,
      username: `${msg.author.username}#${msg.author.discriminator}`
      userId: msg.author.
    }

    return
  }
}

module.exports = CopycatUtils
