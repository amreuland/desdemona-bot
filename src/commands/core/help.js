'use strict'

const { Command, utils: { padEnd } } = require('sylphy')

class Help extends Command {
  constructor (...args) {
    super(...args, {
      name: 'help',
      description: 'Help!',
      group: 'core',
      usage: [
        { name: 'command', type: 'command', optional: true }
      ]
    })
  }

  async handle ({ msg, client, args, settings }, responder) {
    let prefix = client.prefix
    if (args.command) {
      let command = args.command
      let name = command.name
      let description = command.description
      let reply = [
        `**\`${prefix}${name}\`**  __\`${description}\`__\n`,
        `**Usage**: ${prefix}${name} ${Object.keys(command.resolver.usage).map(usage => {
          usage = command.resolver.usage[usage]
          return usage.optional ? `[${usage.displayName}]` : `<${usage.displayName}>`
        }).join(' ')}`
      ]
      if (command.triggers.length > 1) {
        reply.push(`\n**Aliases**: \`${command.triggers.slice(1).join(' ')}\``)
      }
      // reply.push('\n{{footer_group}}')
      return responder.send(reply.join('\n'))
    }
    let commands = {}
    let reply = [
      // `{{header_1}} ${prefix === client.prefix ? '' : '{{header_1_alt}}'}`,
      // '{{header_2}}',
      // '{{header_3}}',
      '**```glsl'
    ]
    let maxPad = 10

    client.plugins.get('commands').unique().forEach(c => {
      if (c.triggers[0] !== c.name || c.options.hidden || c.adminOnly) return
      let module = c.group
      let name = c.name
      let desc = c.description
      if (name.length > maxPad) maxPad = name.length
      if (!Array.isArray(commands[module])) commands[module] = []
      commands[module].push([name, desc])
    })

    for (let mod in commands) {
      if (commands[mod].length === 0) continue
      reply.push([
        `# ${mod}:`,
        commands[mod].map(c => `  ${padEnd(c[0], maxPad)} // ${c[1]}`).join('\n')
      ].join('\n'))
    }
    reply.push('```**')

    return responder.send(reply.join('\n'), {
      DM: true
    }).then(m => {
      if (msg.channel.guild) {
        responder.format('emoji:inbox').reply('check your PMs!')
      }
    })
  }
}

module.exports = Help
