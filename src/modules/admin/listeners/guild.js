'use strict'

const { Listener } = require.main.require('./sylphy')

const R = require('ramda')

const { EventUtils } = require('../util')

class GuildEventsListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'admin:audit:guild:events',
      events: {
        'guildCreate': 'onGuildCreate',
        'guildDelete': 'onGuildDelete',
        'guildAvailable': 'onGuildAvailable',
        'guildBanAdd': 'onGuildBanAdd',
        'guildBanRemove': 'onGuildBanRemove',
        'guildEmojisUpdate': 'onGuildEmojisUpdate',
        'guildMemberAdd': 'onGuildMemberAdd',
        'guildMemberRemove': 'onGuildMemberRemove',
        'guildMemberUpdate': 'onGuildMemberUpdate',
        'guildRoleCreate': 'onGuildRoleCreate',
        'guildRoleDelete': 'onGuildRoleDelete',
        'guildRoleUpdate': 'onGuildRoleUpdate',
        'guildUnavailable': 'onGuildUnavailable',
        'guildUpdate': 'onGuildUpdate'
      }
    })
  }

  /**
   * Called when the bot joins a guild
   * @param  {Guild} guild The guild
   */
  onGuildCreate (guild) {
    this.logger.debug(`Joined guild '${guild.name}' (${guild.id})`)
    let search = { guildId: guild.id }
    return this._client.db.Guild.findOneOrCreate(search, search)
  }

  /**
   * Called when the bot leaves a guild
   * @param  {Guild} guild The guild
   */
  onGuildDelete (guild) {
    this.logger.debug(`Left guild '${guild.name}' (${guild.id})`)
  }

  /**
   * Called when an guild becomes available
   * @param  {Guild} guild The guild
   */
  onGuildAvailable (guild) {
    this.logger.debug(`Guild '${guild.id}' is now available`)
  }

  /**
   * Called when an guild becomes unavailable
   * @param  {Guild} guild The guild
   */
  onGuildUnavailable (guild) {
    this.logger.debug(`Guild '${guild.id}' is now unavailable`)
  }

  /**
   * Called when a user is banned from a guild
   * @param  {Guild} guild The guild
   * @param  {User} user  The banned user
   */
  onGuildBanAdd (guild, user) {

  }

  /**
   * Called when a user is unbanned from a guild
   * @param  {Guild} guild The guild
   * @param  {User} user  The banned user
   */
  onGuildBanRemove (guild, user) {

  }

  /**
   * Called when a guild's emojis are updated
   * @param {Guild} guild The guild
   * @param {Array} emojis The updated emojis of the guild
   * @param {Array} oldEmojis The old emojis of the guild
   */
  onGuildEmojisUpdate (guild, emojis, oldEmojis) {

  }

  /**
   * Called when a member joins a server
   * @param {Guild} guild The guild
   * @param {Member} member The member
   */
  onGuildMemberAdd (guild, member) {
    return this._client.db.Guild.findOne({guildId: guild.id})
      .then(dbGuild => {
        if (!dbGuild) {
          return false
        }

        let auditChannelId = dbGuild.channels.audit
        if (!auditChannelId) {
          return false
        }

        let embed = EventUtils.createUserJoinEmbed(guild, member)
        return this._client.createMessage(auditChannelId, { embed })
      })
  }

  /**
   * Called when a member leaves a server
   * @param  {Guild} guild  The guild
   * @param  {Member | Object} member The member. If the member is not cached, this will be an object with `id` and `user` key
   */
  onGuildMemberRemove (guild, member) {
    return this._client.db.Guild.findOne({guildId: guild.id})
      .then(dbGuild => {
        if (!dbGuild) {
          return false
        }

        let auditChannelId = dbGuild.channels.audit
        if (!auditChannelId) {
          return false
        }

        let embed = EventUtils.createUserLeaveEmbed(guild, member)
        return this._client.createMessage(auditChannelId, { embed })
      })
  }

  /**
   * Called when a member's roles or nickname are updated
   * @param {Guild} guild The guild
   * @param {Member} member The updated member
   * @param {Object?} oldMember The old member data
   * @param {String[]} oldMember.roles An array of role IDs this member is a part of
   * @param {String?} oldMember.nick The server nickname of the member
   */
  onGuildMemberUpdate (guild, member, oldMember) {
    return this._client.db.Guild.findOne({guildId: guild.id})
      .then(dbGuild => {
        if (!dbGuild) {
          return false
        }

        let auditChannelId = dbGuild.channels.audit
        if (!auditChannelId) {
          return false
        }

        if (member.nick !== oldMember.nick) {
          if (!member.nick) {
            let embed = EventUtils.createNickRemovedEmbed(oldMember.nick, member.avatarURL)
            return this._client.createMessage(auditChannelId, { embed })
          }

          let oldNick = oldMember.nick
          if (!oldNick) {
            oldNick = member.username
          }

          let embed = EventUtils.createNickChangedEmbed(oldNick, member.nick, member.avatarURL)
          return this._client.createMessage(auditChannelId, { embed })
        }

        let addedRoles = R.difference(member.roles, oldMember.roles)
        let removedRoles = R.difference(oldMember.roles, member.roles)

        let addedRole = guild.roles.get(addedRoles[0])
        let removedRole = guild.roles.get(removedRoles[0])

        if (!addedRole && !removedRole) { return false }

        let nick = member.nick || member.username

        let embed = EventUtils.createRolesChangedEmbed(nick, addedRole, removedRole, member.avatarURL)
        return this._client.createMessage(auditChannelId, { embed })
      })
  }

  /**
   * Called when a guild role is created
   * @param  {Guild} guild The guild
   * @param  {Role} role  The role
   */
  onGuildRoleCreate (guild, role) {

  }

  /**
   * Called when a guild role is deleted
   * @param  {Guild} guild The guild
   * @param  {Role} role  The role
   */
  onGuildRoleDelete (guild, role) {

  }

  /**
   * Called when a guild role is updated
   * @param  {Guild} guild   The guild
   * @param  {Role} role    The updated role
   * @param  {Object} oldRole The old role data
   * @param  {String} oldRole.name The name of the role
   * @param  {Boolean} oldRole.managed Whether a guild integration manages this role or not
   * @param  {Boolean} oldRole.hoist Whether users with this role are hoisted in the user list or not
   * @param  {Number} oldRole.color The hex color of the role in base 10
   * @param  {Number} oldRole.position The position of the role
   * @param  {Permission} oldRole.permissions The permissions number of the role
   */
  onGuildRoleUpdate (guild, role, oldRole) {

  }

  /**
   * Called when an guild is updated
   * @param {Guild} guild The guild
   * @param {Object} oldGuild The old guild data
   * @param {String} oldGuild.name The name of the guild
   * @param {Number} oldGuild.verificationLevel The guild verification level
   * @param {String} oldGuild.region The region of the guild
   * @param {String?} oldGuild.icon The hash of the guild icon, or null if no icon
   * @param {String} oldGuild.afkChannelID The ID of the AFK voice channel
   * @param {Number} oldGuild.afkTimeout The AFK timeout in seconds
   * @param {String} oldGuild.ownerID The ID of the user that is the guild owner
   * @param {String?} oldGuild.splash The hash of the guild splash image, or null if no splash (VIP only)
   * @param {Object[]} oldGuild.features An array of guild features
   * @param {Object[]} oldGuild.emojis An array of guild emojis
   */
  onGuildUpdate (guild, oldGuild) {

  }
}

module.exports = GuildEventsListener
