'use strict'

const { Command } = require('sylphy')

const playlistUrl = 'https://www.youtube.com/playlist?list='
const videoUrl = 'https://www.youtube.com/watch?v='

class YouTubeSearchCommand extends Command {
  constructor (...args) {
    super(...args, {
      name: 'yt',
      description: 'Search youtube and return the first result',
      aliases: ['youtube'],
      cooldown: 30,
      usage: [
        { name: 'search', displayName: 'search-string', type: 'string', last: true }
      ],
      options: {
        guildOnly: true,
        hidden: false
      },
      examples: [
        {
          args: 'Radioactive',
          description: 'Search youtube for \'Radioactive\''
        }
      ]
    })
  }

  async handle ({ msg, client, args }, responder) {
    if (msg.author.bot) {
      return false
    }

    let search = args.search

    return client.api.google.getYouTubeSearch(search)
      .then(results => {
        let type = results.items[0].id.kind
        let url
        if (type === 'youtube#playlist') {
          url = playlistUrl + results.items[0].id.playlistId
        } else if (type === 'youtube#video') {
          url = videoUrl + results.items[0].id.videoId
        }

        return responder.send(url)
      })
  }
}

module.exports = YouTubeSearchCommand
