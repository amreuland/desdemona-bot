'use strict'

const { Module } = require('sylphy')

const { EventUtils } = require('../util')

class UserEventsModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'user:events',
      events: {
        'userUpdate': 'onUserUpdate'
      }
    })
  }

  /**
   * Called when a user's username, avatar, or discriminator changes
   * @param {User} user The updated user
   * @param {Object} oldUser The old user data
   * @param {String} oldUser.username The username of the user
   * @param {String} oldUser.discriminator The discriminator of the user
   * @param {String} oldUser.avatar The hash of the user's avatar, or null if no avatar
   */
  onUserUpdate (user = {}, oldUser = {}) {
    if (!user || !oldUser) {
      return
    }

    if (user.avatar !== oldUser.avatar) {
      return false
    }

    let embed = EventUtils.createUsernameChangedEmbed(oldUser, user)

    return Promise.map(this._client.guilds.values(), guild => {
      if (!guild.members.has(user.id)) {
        return false
      }

      return this._client.db.Guild.findOne({ guildId: guild.id })
        .then(dbGuild => {
          let auditChannelId = dbGuild.channels.audit
          if (!auditChannelId) {
            return false
          }

          return this._client.createMessage(auditChannelId, { embed })
        })
    })
  }
}

module.exports = UserEventsModule
