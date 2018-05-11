'use strict'

const R = require('ramda')

const { Command } = require.main.require('./sylphy')

const rolesPP = 10

class IAmListCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'iamlist',
      description: 'List self assignable roles',
      usage: [{ name: 'page', displayName: 'page#', type: 'int', min: 1, optional: true }],
      examples: [
        {
          args: '2',
          description: 'view the second role list page'
        }
      ],
      cooldown: 2,
      options: {
        guildOnly: true
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let currentPage = args.page || 1
    currentPage--

    return client.db.SelfAssignedRole.find({ guildId })
      .count()
      .then(count => {
        return responder.paginate({
          currentPage,
          total: count,
          ipp: rolesPP,
          func: page => {
            return client.db.SelfAssignedRole.find({ guildId })
            .sort({ group: 'asc', '_id': 'asc' })
            .skip(page * rolesPP)
            .limit(rolesPP)
            .then(dbSARs => {
              let ret = [
                '```glsl'
              ]
              let groups = R.groupBy(R.prop('group'), dbSARs)

              for (const g in groups) {
                let group = groups[g]
                ret.push(`#Group ${g}`)

                for (const r of group) {
                  let role = guild.roles.get(r.roleId)
                  if (!role) { continue }
                  ret.push(`\t${role.name}`)
                }
              }

              ret.push('```')

              return { content: ret.join('\n') }
            })
          }
        })
      })
  }
}

module.exports = IAmListCommand
