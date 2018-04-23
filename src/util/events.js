'use strict'

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
  rolesChanged: ':card_index:'
}

class EventUtils {
  constructor (client) {
    EventUtils._client = client
  }

  static createUsernameChangeEmbed (oldUser, newUser) {

  }

  static createNickChangeEmbed (oldNick, newNick, avatarUrl) {
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
        value: addedRole.name
      }
    } else {
      field = {
        name: 'Removed Role',
        value: removedRole.name
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
