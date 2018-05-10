'use strict'

const moment = require('moment')

const dateTimeFormat = ts => moment(ts).format('dddd, MMMM Do YYYY @ hh:mm:ss A')

class UtilityUtils {
  static createUserInfoEmbed (member) {
    let userFull = `${member.username}#${member.discriminator}`
    let fields = [
      {
        name: 'ID',
        value: member.id,
        inline: true
      },
      {
        name: 'Status',
        value: member.status,
        inline: true
      }
    ]

    if (member.nick) {
      fields.push({
        name: 'Nickname',
        value: member.nick,
        inline: true
      })
    }

    let guild = member.guild
    let roles = member.roles.map(r => guild.roles.get(r).name) || []

    fields.push({
      name: 'Account Created',
      value: dateTimeFormat(member.createdAt)
    }, {
      name: 'Join Date',
      value: dateTimeFormat(member.joinedAt)
    }, {
      name: `Roles (${roles.length})`,
      value: roles.join(', ')
    })

    return {
      author: {
        name: userFull,
        icon_url: member.avatarURL
      },
      thumbnail: {
        url: member.avatarURL,
        height: 80,
        width: 80
      },
      fields,
      color: 0xff9966
    }
  }
}

module.exports = {
  UtilityUtils
}
