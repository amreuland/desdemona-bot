'use strict'

const moment = require('moment')

const colors = {
  userJoin: 0x7ba600,
  userLeave: 0xd12b2b,
  nicknameRemoved: 0x016091,
  nicknameChanged: 0x67a9d3,
  usernameChanged: 0x0dc5ad,
  rolesChanged: 0x7e25e1
}

const emojis = {
  nicknameChanged: ':capital_abcd:',
  rolesChanged: ':card_index:',
  userJoin: ':inbox_tray:',
  userLeave: ':outbox_tray:'
}

class EventUtils {
  constructor (client) {
    EventUtils._client = client
  }

  static createUserJoinEmbed (guild, member) {
    let description = `${emojis.userJoin} **${member.username}#${member.discriminator}** has \`joined\` the server. (${member.id})`

    let userCreateDiff = moment().diff(member.createdAt, 'hours')

    if (userCreateDiff < 24) {
      description = description + `\n\n**Account created ${userCreateDiff} hours ago**`
    }

    return {
      color: colors.userJoin,
      description,
      footer: {
        text: `User Join (${guild.memberCount})`,
        icon_url: member.avatarURL
      },
      timestamp: new Date()
    }
  }

  static createUserLeaveEmbed (guild, member) {
    return {
      color: colors.userLeave,
      description: `${emojis.userLeave} **${member.username}#${member.discriminator}** has \`left\` the server. (${member.id})`,
      footer: {
        text: `User Leave (${guild.memberCount})`,
        icon_url: member.avatarURL
      },
      timestamp: new Date()
    }
  }

  static createUsernameChangedEmbed (oldUser, newUser) {
    return {
      color: colors.usernameChanged,
      description: `${emojis.nicknameChanged} **${oldUser.username}#${oldUser.discriminator}** is now known as **${newUser.username}#${newUser.discriminator}**`,
      footer: {
        text: 'Username Changed',
        icon_url: newUser.avatarURL
      },
      timestamp: new Date()
    }
  }

  static createNickChangedEmbed (oldNick, newNick, avatarUrl) {
    return {
      color: colors.nicknameChanged,
      description: `${emojis.nicknameChanged} **${oldNick}**'s nickname was \`changed\` to **${newNick}**`,
      footer: {
        text: 'Nickname Changed',
        icon_url: avatarUrl
      },
      timestamp: new Date()
    }
  }

  static createNickRemovedEmbed (oldNick, avatarUrl) {
    return {
      color: colors.nicknameRemoved,
      description: `${emojis.nicknameChanged} **${oldNick}**'s nickname was \`removed\``,
      footer: {
        text: 'Nickname Removed',
        icon_url: avatarUrl
      },
      timestamp: new Date()
    }
  }

  static createRolesChangedEmbed (nick, addedRole, removedRole, avatarUrl) {
    let field
    if (addedRole) {
      field = {
        name: 'Added Role',
        value: addedRole.name,
        inline: true
      }
    } else {
      field = {
        name: 'Removed Role',
        value: removedRole.name,
        inline: true
      }
    }

    return {
      color: colors.rolesChanged,
      description: `${emojis.rolesChanged} **${nick}**'s roles were \`updated\``,
      fields: [ field ],
      footer: {
        text: 'Roles Updated',
        icon_url: avatarUrl
      },
      timestamp: new Date()
    }
  }
}

module.exports = EventUtils
