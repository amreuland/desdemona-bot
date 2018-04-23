'use strict'

const { Module } = require('sylphy')

class GuildEventModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'guild:events',
      events: {
        'guildBanAdd': 'onGuildBanAdd',
        'guildBanRemove': 'onGuildBanRemove',
        'guildEmojisUpdate': 'onGuildEmojisUpdate',
        'guildMemberAdd': 'onGuildMemberAdd',
        'guildMemberRemove': 'onGuildMemberRemove',
        'guildMemberUpdate': 'onGuildMemberUpdate',
        'guildRoleCreate': 'onGuildRoleCreate',
        'guildRoleDelete': 'onGuildRoleDelete',
        'guildRoleUpdate': 'onGuildRoleUpdate',
        'guildUpdate': 'onGuildUpdate'
      }
    })
  }

  onGuildBanAdd (guild, user) {

  }

  onGuildBanRemove (guild, user) {

  }

  onGuildEmojisUpdate (guild, emojis, oldEmojis) {

  }

  onGuildMemberAdd (guild, member) {

  }

  onGuildMemberRemove (guild, member) {

  }

  onGuildMemberUpdate (guild, member, oldMember) {

  }

  onGuildRoleCreate (guild, role) {

  }

  onGuildRoleDelete (guild, role) {

  }

  onGuildRoleUpdate (guild, role, oldRole) {

  }

  onGuildUpdate (guild, oldGuild) {

  }
}

module.exports = GuildEventModule
