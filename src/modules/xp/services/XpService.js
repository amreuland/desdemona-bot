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

  static getLevelFromXp (xp) {
    return Math.ceiling(Math.sqrt(xp) * 0.12) - 1
  }

  static getXpRangeForLevel (lvl) {
    let lvlSqLow = lvl ** 2
    let lvlSqHigh = (lvl + 1) ** 2
    let low = Math.floor((69 * lvlSqLow) + (lvlSqLow / 2.25))
    let high = Math.floor((69 * lvlSqHigh) + (lvlSqHigh / 2.25))
    let diff = high - low

    return [low, high, diff]
  }

  static getXpRangeForXp (xp) {
    return XpService.getXpRangeForLevel(XpService.getLevelFromXp(xp))
  }

  getMemberStats (member) {
    let userId = member.id
    let guildId = member.guild.id

    return this.client.db.User.findOne({ userId })
      .populate({
        path: 'guildStats',
        match: { guildId }
      })
      .then(async dbUser => {
        if (!dbUser) {
          return new UserStats(userId, guildId, 0, 0, 0, -1, 0, -1)
        }

        if (!dbUser.guildStats || !dbUser.guildStats.length) {
          return new UserStats(userId, guildId,
            dbUser.reputation, dbUser.money,
            0, -1, dbUser.globalXp, )
        }
      })
  }
}

module.exports = XpService

class LevelStats {
  constructor (xp) {
    this.level = XpService.getLevelFromXp(xp)
    let [low, high, diff] = XpService.getXpRangeForLevel(this.level)

    this.levelXp = xp - low
    this.requiredXp = diff
    this.totalXp = xp
  }
}

class UserStats {
  constructor (memberId, guildId,
    reputation, money,
    guildStats, guildRanking,
    globalStats, globalRanking) {
    this.memberId = memberId
    this.guildId = guildId
    this.reputation = reputation
    this.money = money
    this.guildStats = (guildStats instanceof LevelStats) ? guildStats : new LevelStats(guildStats)
    this.guildRanking = guildRanking
    this.globalStats = (globalStats instanceof LevelStats) ? globalStats : new LevelStats(globalStats)
    this.globalRanking = globalRanking
  }
}
