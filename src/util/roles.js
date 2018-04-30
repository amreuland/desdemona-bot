'use strict'

const R = require('ramda')

class RoleUtils {
  static doesMemberOutrankMember (member1, member2) {
    let guild = member1.guild
    let m1RoleHigh = this.getHighestUserRole(member1.roles, guild.roles) || {position: 0}
    let m2RoleHigh = this.getHighestUserRole(member2.roles, guild.roles) || {position: 0}

    return m1RoleHigh.position > m2RoleHigh.position
  }

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
