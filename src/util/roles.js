'use strict'

const R = require('ramda')

class RoleUtils {
  static getHighestUserRole (memberRoles, guildRoles) {
    let highestRole = R.compose(
      R.last,
      R.sortBy(R.prop('position')),
      R.map(memberRole => guildRoles.get(memberRole))
    )(memberRoles)

    return highestRole
  }
}

module.exports = RoleUtils
