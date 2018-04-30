'use strict'

const moment = require('moment')
const R = require('ramda')
const RoleUtils = require('./roles')

class CopycatUtils {
  static sanitizeMentions (msg) {
    let content = msg.content || ''

    if (msg.mentions) {
      msg.mentions.forEach(mention => {
        let member = msg.channel.guild.members.get(mention.id)
        content = content.replace(
          new RegExp(`<@!?${mention.id}>`, 'g'),
          `@${!member.nick ? member.username : member.nick}`
        )
      })
    }

    if (msg.roleMentions) {
      msg.roleMentions.forEach(roleId => {
        let role = msg.channel.guild.roles.get(roleId)
        content = content.replace(
          new RegExp(`<@&${roleId}>`, 'g'),
          `@${role ? role.name : 'deleted-role'}`
        )
      })
    }

    content = content
      .replace(/@everyone/g, '@\u200beveryone')
      .replace(/@here/g, '@\u200bhere')

    return content
  }

  static createMirrorEmbed (msg) {
    let description = `**Posted in ${msg.channel.mention}**`
    let author = {
      name: `${msg.author.username}#${msg.author.discriminator}`,
      icon_url: msg.author.avatarURL
    }

    if (msg.member.nick) {
      author.name = `${msg.member.nick} (${author.name})`
    }

    let highRole = RoleUtils.getHighestUserRole(
      msg.member.roles, msg.channel.guild.roles) || {}

    // let title = `Posted in ${msg.channel.mention}`

    let content = this.sanitizeMentions(msg)

    let image = R.find(R.has('width'), msg.attachments)

    if (image && (!content || content === '')) {
      content = '*Picture*'
    }

    let parts = R.splitAt(1024, content)

    if (parts[1] === '') {
      parts.pop()
    }

    let fields = [
      {
        name: 'Message ID',
        value: msg.id,
        inline: false
      },
      {
        name: `Content${parts.length > 1 ? ' part 1' : ''}`,
        value: parts[0],
        inline: false
      }
    ]

    if (parts.length > 1) {
      fields.push({
        name: 'Content part 2',
        value: parts[1],
        inline: false
      })
    }

    let footer = {
      text: `User ID: ${msg.author.id}`
    }

    let timestamp = moment(msg.timestamp).toDate()

    let color = highRole.color || 0x99AAB5

    return {
      description,
      timestamp,
      color,
      footer,
      author,
      fields
    }
  }
}

module.exports = CopycatUtils
