'use strict'

const R = require('ramda')

const { Command } = require('sylphy')

const rolesPerPage = 10

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
      options: {
        guildOnly: true
      }
    })
  }

  async handle ({ msg, client, args }, responder) {
    let guild = msg.channel.guild
    let guildId = guild.id
    let page = args.page || 1

    return client.db.Guild.findOneOrCreate({ guildId }, { guildId })
      .then(dbGuild => {
        let roles = R.map(roleId => guild.roles.get(roleId).name, dbGuild.selfroles)
        roles = R.splitEvery(10, roles)
        let index = 0
        let pageRoles = R.map(role => {
          index++
          return `#${page * index}. ${role}`
        }, R.slice(page - 1, page, roles))

        return responder
          .format('emoji:scroll')
          .send(`{{iamlist.strings.HEADER}}\`\`\`${pageRoles.join('\n')}\`\`\``, {
            page: page,
            pageOf: roles.length
          })
      })
  }
}

module.exports = IAmListCommand
