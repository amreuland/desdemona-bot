'use strict'

const RANDOM_MONEY_MAX = 5
const RANDOM_MONEY_MIN = 1

const RANDOM_POINTS_MAX = 5
const RANDOM_POINTS_MIN = 1

const RANDOM_XP_MAX = 20
const RANDOM_XP_MIN = 10

const RANDOM_MONEY_RANGE = RANDOM_MONEY_MAX - RANDOM_MONEY_MIN + 1
const RANDOM_POINTS_RANGE = RANDOM_POINTS_MAX - RANDOM_POINTS_MIN + 1
const RANDOM_XP_RANGE = RANDOM_XP_MAX - RANDOM_XP_MIN + 1

const REWARD_TIMEOUT = 120

module.exports = {
  name: 'chatRewards',
  priority: 20,
  process: container => {
    const { msg, client, isPrivate } = container

    if (isPrivate) {
      return Promise.resolve(container)
    }

    let member = msg.member
    let userId = member.id
    let guildId = member.guild.id

    let cacheKey = `chat:flag:${guildId}:${member.id}`

    return client.cache.core.get(cacheKey)
      .then(data => {
        if (data) { return }
        let randomMoney = Math.floor(Math.random() * RANDOM_MONEY_RANGE) + RANDOM_MONEY_MIN
        let randomPoints = Math.floor(Math.random() * RANDOM_POINTS_RANGE) + RANDOM_POINTS_MIN
        let randomXp = Math.floor(Math.random() * RANDOM_XP_RANGE) + RANDOM_XP_MIN

        return Promise.all([
          client.db.User.findOneOrCreate({ userId }, { userId }),
          client.db.UserStats.findOneOrCreate({ userId, guildId }, { userId, guildId })
        ])
          .then(([dbUser, dbStats]) => {
            dbUser.money += randomMoney
            dbUser.globalXp += randomXp
            dbStats.guildPoints += randomPoints
            dbStats.guildXp += randomXp

            return Promise.all([dbUser.save(), dbStats.save()])
          })
          .then(() => client.cache.core.set(cacheKey, 1, 'EX', REWARD_TIMEOUT))
      })
      .then(() => container)
  }
}
