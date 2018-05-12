'use strict'

const Enum = require('enum')

const DiscordRESTError = require('eris/lib/errors/DiscordRESTError')

const { NaviService } = require.main.require('./lib')

const addResults = new Enum(['SUCCESS', 'ERROR_ALREADY_EXIST'])
const removeResults = new Enum(['SUCCESS', 'ERROR_NOT_EXIST'])
const assignResults = new Enum([
  'SUCCESS',
  'ERROR_NOT_ASSIGNABLE',
  'ERROR_ALREADY_HAVE',
  'ERROR_NO_PERMS'
])

const unassignResults = new Enum([
  'SUCCESS',
  'ERROR_NOT_ASSIGNABLE',
  'ERROR_NOT_HAVE',
  'ERROR_NO_PERMS'
])

class SelfAssignedRolesService extends NaviService {
  constructor (...args) {
    super(...args, {
      name: 'SelfAssignedRoles'
    })
  }

  get addResults () { return addResults }

  get removeResults () { return removeResults }

  get assignResults () { return assignResults }

  get unassignResults () { return unassignResults }

  add (role, group = 0) {
    let guildId = role.guild.id
    let roleId = role.id
    return this.client.db.SelfAssignedRole.findOne({ guildId, roleId })
      .then(dbSAR => {
        if (dbSAR) {
          return Promise.reject(this.addResults.ERROR_ALREADY_EXIST)
        }
        return this.client.db.SelfAssignedRole.create({ guildId, roleId, group })
      })
      .then(() => this.addResults.SUCCESS)
  }

  remove (role) {
    let guildId = role.guild.id
    let roleId = role.id

    return this.client.db.SelfAssignedRole.findOne({ guildId, roleId })
      .then(dbSAR => {
        if (!dbSAR) {
          return Promise.reject(this.removeResults.ERROR_NOT_EXIST)
        }
        return dbSAR.remove()
      })
      .then(() => this.removeResults.SUCCESS)
  }

  assign (member, role) {
    if (member.roles.includes(role.id)) {
      return Promise.reject(this.assignResults.ERROR_ALREADY_HAVE)
    }

    let guildId = member.guild.id
    let roleId = role.id

    return this.client.db.SelfAssignedRole.findOne({ guildId, roleId })
      .then(dbRole => {
        if (!dbRole) {
          return Promise.reject(this.assignResults.ERROR_NOT_ASSIGNABLE)
        }
        return member.addRole(roleId, 'Self Assigned Roles Add')
      })
      .then(() => this.assignResults.SUCCESS)
      .catch(DiscordRESTError, () => Promise.reject(this.assignResults.ERROR_NO_PERMS))
  }

  unassign (member, role) {
    if (!member.roles.includes(role.id)) {
      return Promise.reject(this.unassignResults.ERROR_NOT_HAVE)
    }

    let guildId = member.guild.id
    let roleId = role.id

    return this.client.db.SelfAssignedRole.findOne({ guildId, roleId })
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
