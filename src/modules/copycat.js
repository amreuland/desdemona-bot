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

    let copyCache = this._client.cache.copycat

    return copyCache.smembers(`copycat:channel:${channelId}`)
      .then(data => {
        if (!data || !data.length) {
          return copyCache.get(`copycat:flag:guildId`)
            .then(flag => {
              if (flag) {
                return null
              }

              return
            })
        }

        return data
      })
      .then(data => {
        if (!data || !data.length) {
          return
        }

        let message = CopycatUtils.createMirrorEmbed(message)
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
