'use strict'

const DiscordRESTError = require('eris/lib/errors/DiscordRESTError')

const assignResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_NOT_ASSIGNABLE: {code: 'ERROR_NOT_ASSIGNABLE'},
  ERROR_ALREADY_HAVE: {code: 'ERROR_ALREADY_HAVE'},
  ERROR_NO_PERMS: {code: 'ERROR_NO_PERMS'}
})

const removeResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_NOT_ASSIGNABLE: {code: 'ERROR_NOT_ASSIGNABLE'},
  ERROR_NOT_HAVE: {code: 'ERROR_NOT_HAVE'},
  ERROR_NO_PERMS: {code: 'ERROR_NO_PERMS'}
})

class SelfAssignableRolesService {
  static get assignResults () { return assignResults }

  static get removeResults () { return removeResults }

  static assign (client, member, role) {
    if (member.roles.includes(role.id)) {
      return Promise.reject(this.assignResults.ERROR_ALREADY_HAVE)
    }

    let guildId = member.guild.id

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        if (!dbGuild.selfroles.includes(role.id)) {
          return Promise.reject(this.assignResults.ERROR_NOT_ASSIGNABLE)
        }

        return member.addRole(role.id, 'Self Roles Add')
          .then(() => this.assignResults.SUCCESS)
          .catch(DiscordRESTError, () => Promise.reject(this.assignResults.ERROR_NO_PERMS))
      })
  }

  static remove (client, member, role) {
    if (!member.roles.includes(role.id)) {
      return Promise.reject(this.removeResults.ERROR_NOT_HAVE)
    }

    let guildId = member.guild.id

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        if (!dbGuild.selfroles.includes(role.id)) {
          return Promise.reject(this.removeResults.ERROR_NOT_ASSIGNABLE)
        }

        return member.removeRole(role.id, 'Self Roles Remove')
          .then(() => this.removeResults.SUCCESS)
          .catch(DiscordRESTError, () => Promise.reject(this.removeResults.ERROR_NO_PERMS))
      })
  }
}

module.exports = SelfAssignableRolesService
