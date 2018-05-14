'use strict'

const { Listener } = require.main.require('./sylphy')

const { EventUtils } = require('../util')

class UserEventsListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'admin:audit:user:events',
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

    return this._client.db.Guild.find({
      guildId: {
        $in: [...this._client.guilds.values()].map(g => g.id)
      }
    })
      .then(dbGuilds => {
        return dbGuilds.filter(g => {
          let guild = this._client.guilds.get(g.guildId)
          return guild.members.has(user.id) &&
            g.channels &&
            g.channels.audit &&
            guild.channels.has(g.channels.audit)
        }).map(g => g.channels.audit)
      })
      .map(channelId => this._client.createMessage(channelId, { embed }))
  }
}

module.exports = UserEventsListener
