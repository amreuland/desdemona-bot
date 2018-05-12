module.exports = {
  type: 'channel',
  resolve: (content, { text, voice } = {}, msg) => {
    let type = -1
    if (text) type = 0
    else if (voice) type = 2
    const guild = msg.channel.guild
    content = String(content).toLowerCase()
    let channel = content.match(/^<#([0-9]+)>$/)
    if (!channel) {
      let channels = guild.channels.filter(c => {
        let name = c.name.toLowerCase()
        let cType = type === -1 ? c.type : type
        return (name === content || name.includes(content)) && c.type === cType
      })
      if (channels.length) {
        return Promise.resolve(channels)
      } else {
        return Promise.reject('channel.NOT_FOUND')
      }
    } else {
      let c = guild.channels.get(channel[1])
      if (!c) return Promise.reject('channel.NOT_FOUND')
      return Promise.resolve([c])
    }
  }
}
