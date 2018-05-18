'use strict'

const { NaviService } = require.main.require('./lib')

class BlacklistService extends NaviService {
  constructor (...args) {
    super(...args, { name: 'Blacklist' })
  }

  blacklist (entity, reason, time) {

  }

  unblacklist (entity) {

  }

  blacklistUser (user, reason, time) {

  }

  blacklistGuild (guild, reason, time) {

  }

  isBlacklisted (entity) {

  }

  isUserBlacklisted (userId) {
    return Promise.resolve(false)
  }

  isGuildBlacklisted (guildId) {
    return Promise.resolve(false)
  }
}

module.exports = BlacklistService
