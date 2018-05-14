'use strict'

const { NaviService } = require.main.require('./lib')

/**
 * Tatsumaki Exp Formulas
 * Level -> Lowest EXP: floor(69x^2 + (x^2)/2.25)
 * EXP -> Level: ceiling(sqrt(x) * 0.12) - 1
 */

class XpService extends NaviService {
  constructor (...args) {
    super(...args, { name: 'Xp' })
  }

  getMemberStats (member) {
    let userId = member.id
    let guildId = member.guild.id
  }
}

module.exports = XpService
