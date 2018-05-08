'use strict'

const steamIconUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/256px-Steam_icon_logo.svg.png'

const steamPersonaState = [
  'Offline',
  'Online',
  'Busy',
  'Away',
  'Snooze',
  'looking to trade',
  'looking to play'
]

const steamVisibilityState = [
  'Unknown',
  'Private',
  'Unknown',
  'Public'
]

class SteamUtils {
  static createSteamProfileEmbed (member, data, steamId) {
    let status = 'Unknown'

    if (data.visibilityState === 3) {
      status = `**${steamPersonaState[data.personaState]}**`
      if (data.gameId) {
        status = `**In-Game: ${data.gameExtraInfo}**`
      }
    }

    let fields = [
      {
        name: 'Steam Name',
        value: `**${data.nickname}**`,
        inline: true
      },
      {
        name: 'Status',
        value: status,
        inline: true
      },
      {
        name: 'Profile State',
        value: `**${steamVisibilityState[data.visibilityState]}**`,
        inline: true
      },
      {
        name: '.',
        value: '.',
        inline: true
      },
      {
        name: 'SteamID',
        value: `**${steamId.getSteam2RenderedID(true)}**`,
        inline: true
      },
      {
        name: 'SteamID3',
        value: `**${steamId.getSteam3RenderedID()}**`,
        inline: true
      },
      {
        name: 'SteamID64',
        value: `**${steamId.getSteamID64()}**`,
        inline: false
      }
    ]

    return {
      author: {
        name: 'Steam',
        url: 'https://steamcommunity.com',
        icon_url: steamIconUrl
      },
      title: 'Steam Profile',
      url: data.url,
      thumbnail: {
        url: data.avatar.large,
        height: 184,
        width: 184
      },
      provider: {
        name: 'Steam',
        url: 'https://steamcommunity.com'
      },
      fields
    }
  }
}

module.exports = SteamUtils
