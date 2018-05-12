'use strict'

// const { User, Member, Guild } = require('eris')

const { NaviService } = require.main.require('./lib')

class BlacklistService extends NaviService {
  constructor (...args) {
    super(...args, {
      name: 'Blacklist'
    })
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
}

module.exports = BlacklistService
