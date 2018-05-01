'use strict'

const { Command, utils: { padEnd } } = require('sylphy')

class HelpCommand extends Command {
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
        `**Usage**: ${command.resolver.getUsage(command.usage, {prefix, command: name})}`
      ]
      if (command.triggers.length > 1) {
        reply.push(`\n**Aliases**: \`${command.triggers.slice(1).join(' ')}\``)
      }
      // reply.push('\n{{footer_group}}')
      return responder.send(reply.join('\n'))
    }
    let commands = {}
    let reply = [
      '{{%help.HEADER}}',
      '**```glsl'
    ]
    let maxPad = 10

    client.plugins.get('commands').unique().forEach(c => {
      let permissions = c.options.permissions
      if (c.triggers[0] !== c.name || c.options.hidden || c.options.adminOnly ||
        (permissions && permissions.length &&
          !this.hasPermissions(msg.channel, msg.author, permissions))) {
        return
      }

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
      DM: true,
      guild: msg.channel.guild.name
    }).then(m => {
      if (msg.channel.guild) {
        responder.format('emoji:inbox').reply('check your PMs!')
      }
    })
  }
}

module.exports = HelpCommand
