'use strict'

const DiscordRESTError = require('eris/lib/errors/DiscordRESTError')

const addResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_ALREADY_EXIST: {code: 'ERROR_ALREADY_EXIST'}
})

const removeResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_NOT_EXIST: {code: 'ERROR_NOT_EXIST'}
})

const assignResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_NOT_ASSIGNABLE: {code: 'ERROR_NOT_ASSIGNABLE'},
  ERROR_ALREADY_HAVE: {code: 'ERROR_ALREADY_HAVE'},
  ERROR_NO_PERMS: {code: 'ERROR_NO_PERMS'}
})

const unassignResults = Object.freeze({
  SUCCESS: {code: 'SUCCESS'},
  ERROR_NOT_ASSIGNABLE: {code: 'ERROR_NOT_ASSIGNABLE'},
  ERROR_NOT_HAVE: {code: 'ERROR_NOT_HAVE'},
  ERROR_NO_PERMS: {code: 'ERROR_NO_PERMS'}
})

class SelfAssignedRolesService {
  static get addResults () { return addResults }

  static get removeResults () { return removeResults }

  static get assignResults () { return assignResults }

  static get unassignResults () { return unassignResults }

  static add (client, role, group = 0) {
    let guildId = role.guild.id
    let roleId = role.id
    return client.db.SelfAssignedRole.findOne({ guildId, roleId })
      .then(dbSAR => {
        if (dbSAR) {
          return Promise.reject(this.addResults.ERROR_ALREADY_EXIST)
        }
        return client.db.SelfAssignedRole.create({ guildId, roleId, group })
      })
      .then(() => this.addResults.SUCCESS)
  }

  static remove (client, role) {
    let guildId = role.guild.id
    let roleId = role.id

    return client.db.SelfAssignedRole.findOne({ guildId, roleId })
      .then(dbSAR => {
        if (!dbSAR) {
          return Promise.reject(this.removeResults.ERROR_NOT_EXIST)
        }
        return dbSAR.remove()
      })
      .then(() => this.removeResults.SUCCESS)
  }

  static assign (client, member, role) {
    if (member.roles.includes(role.id)) {
      return Promise.reject(this.assignResults.ERROR_ALREADY_HAVE)
    }

    let guildId = member.guild.id
    let roleId = role.id

    return client.db.SelfAssignedRole.findOne({ guildId, roleId })
      .then(dbRole => {
        if (!dbRole) {
          return Promise.reject(this.assignResults.ERROR_NOT_ASSIGNABLE)
        }
        return member.addRole(roleId, 'Self Assigned Roles Add')
      })
      .then(() => this.assignResults.SUCCESS)
      .catch(DiscordRESTError, () => Promise.reject(this.assignResults.ERROR_NO_PERMS))
  }

  static unassign (client, member, role) {
    if (!member.roles.includes(role.id)) {
      return Promise.reject(this.unassignResults.ERROR_NOT_HAVE)
    }

    let guildId = member.guild.id
    let roleId = role.id

    return client.db.SelfAssignedRole.findOne({ guildId, roleId })
      .then(dbRole => {
        if (!dbRole) {
          return Promise.reject(this.unassignResults.ERROR_NOT_ASSIGNABLE)
        }
        return member.removeRole(roleId, 'Self Roles Remove')
      })
      .then(() => this.unassignResults.SUCCESS)
      .catch(DiscordRESTError, () => Promise.reject(this.unassignResults.ERROR_NO_PERMS))
  }
}

module.exports = SelfAssignedRolesService
