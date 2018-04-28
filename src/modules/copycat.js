'use strict'

const { Module } = require('sylphy')

const { CopycatUtils } = require('../util')

class CopycatModule extends Module {
  constructor (...args) {
    super(...args, {
      name: 'copycat:logic',
      events: {
        messageCreate: 'onMessageCreate',
        messageDelete: 'onMessageDelete',
        messageUpdate: 'onMessageUpdate'
      }
    })
  }

  onMessageCreate (message) {
    let channelId = message.channel.id
    let guildId = message.channel.guild.id
    let messageId = message.id

    let copyCache = this._client.cache.copycat

    if (message.author.bot) {
      return false
    }

    return copyCache.smembers(`copycat:channel:${channelId}`)
      .then(data => {
        if (!data || !data.length) {
          return copyCache.get(`copycat:flag:${guildId}`)
            .then(flag => {
              if (flag) {
                return null
              }

              return this._client.db.Copycat.findOne({guildId, channelId})
                .then(dbItem => {
                  if (!dbItem || !dbItem.targets.length) {
                    return copyCache.set(`copycat:flag:${guildId}`, 1, 'EX', 3600)
                      .return(null)
                  }

                  let items = dbItem.targets
                  return copyCache.sadd(`copycat:channel:${channelId}`, ...items)
                    .then(() => copyCache.expire(`copycat:channel:${channelId}`, 3600))
                    .return(items)
                })
            })
        }

        return data
      })
      .then(data => {
        if (!data || !data.length) {
          return
        }

        let embed = CopycatUtils.createMirrorEmbed(message)

        Promise.map(data, destinationId => {
          return this._client.createMessage(destinationId, { embed })
            .then(newMsg => {
              return copyCache.sadd(`copycat:message:${messageId}`, newMsg.id)
            })
        }).then(() => {
          return copyCache.expire(`copycat:message:${messageId}`, 3600)
        })
      })
    // First check cache for channel id as key
    // If found, take value and use as copy channel
    // Check Cache for flag saying we have already checked guiild db in X time
    // If flag, don't check db
    // If no flag, check db, using guild id, look for copycat channels
    // If any found, set all in the database
    // Set flag in cache saying we have checked
    // Set expiry on flag
    // Take key for channel and get value of destination
    // Send message formatted to look like quote to destination
    // Store source message id and destination message id in cache as
    //    source => destination
    // Set expiry on source key
  }

  onMessageDelete (message) {

  }

  onMessageUpdate (message, OldMessage) {
    // Check cache for message id matching message id
    // If found, get value of shadow-message in copy channel
    // Update shadow-message with message content
    // Set expiry on message id
  }

  // Clearing flag:
  // When command runs
  // If we add a copy channel
  // Set in database, set in cache, set expiry and remove flag
  // If we remove channel
  // Remove entry from cache
}

module.exports = CopycatModule
