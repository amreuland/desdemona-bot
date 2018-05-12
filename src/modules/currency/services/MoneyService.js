'use strict'

const Enum = require('enum')

const { NaviService } = require.main.require('./lib')

const transactionResults = new Enum([
  'SUCCESS',
  'ERROR_NOT_ENOUGH',
  'ERROR_NOT_ENOUGH_FROM',
  'ERROR_TOO_MUCH',
  'ERROR_TOO_MUCH_TO'
])

const MAX_MONEY = Number.MAX_SAFE_INTEGER

class MoneyService extends NaviService {
  constructor (...args) {
    super(...args, { name: 'Money' })
  }

  get transactionResults () { return transactionResults }

  getUserMoney (user) {
    let userId = user.id ? user.id : user

    return this.client.db.User.findOne({ userId })
      .select('money')
      .then(dbUser => dbUser ? dbUser.money : 0)
  }

  setUserMoney (user, money) {
    let userId = user.id ? user.id : user

    if (money > MAX_MONEY) {
      return Promise.reject(this.transactionResults.ERROR_TOO_MUCH)
    }

    return this.client.db.User.findOneAndUpdate({ userId }, { userId, money }, { upsert: true })
      .then(() => true)
  }

  addUserMoney (user, amount) {
    let userId = user.id ? user.id : user

    return this.client.db.User.findOneOrCreate({ userId }, { userId })
      .select('money')
      .then(dbUser => {
        if (dbUser.money + amount > MAX_MONEY) {
          return Promise.reject(this.transactionResults.ERROR_TOO_MUCH)
        }

        dbUser.money += amount
        return dbUser.save().return(dbUser.money)
      })
  }

  removeUserMoney (user, amount) {
    let userId = user.id ? user.id : user

    return this.client.db.User.findOne({ userId })
      .select('money')
      .then(dbUser => {
        if (!dbUser || dbUser.money - amount < 0) {
          return Promise.reject(this.transactionResults.ERROR_NOT_ENOUGH)
        }

        dbUser.money -= amount
        return dbUser.save().return(dbUser.money)
      })
  }

  transferUserMoney (fromUser, toUser, amount) {
    let fromId = fromUser.id ? fromUser.id : fromUser
    let toId = toUser.id ? toUser.id : toUser

    return this.client.db.User.find({ userId: { $in: [fromId, toId] } })
      .select('money')
      .then(async dbUsers => {
        let fromUsr = dbUsers.find(u => u.userId === fromId)
        let toUsr = dbUsers.find(u => u.userId === toId)

        if (!fromUsr || fromUsr.money - amount < 0) {
          return Promise.reject(this.transactionResults.ERROR_NOT_ENOUGH_FROM)
        }

        if (!toUsr) {
          toUsr = await this.client.db.User.create({ userId: toId })
        }

        if (toUsr.money > MAX_MONEY) {
          return Promise.reject(this.transactionResults.ERROR_TOO_MUCH_TO)
        }

        fromUsr.money -= amount
        toUsr.money += amount

        return Promise.all([fromUsr.save(), toUsr.save()])
          .then(([f, t]) => {
            Promise.resolve(f.money, t.money)
          })
      })
  }
}

module.exports = MoneyService
