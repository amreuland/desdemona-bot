'use strict'

const { Listener } = require.main.require('./sylphy')

class ChannelEventsListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'admin:audit:channel:events',
      events: {
        'channelCreate': 'onChannelCreate',
        'channelDelete': 'onChannelDelete',
        'channelPinUpdate': 'onChannelPinUpdate',
        'channelUpdate': 'onChannelUpdate'
      }
    })
  }

  /**
   * Called when a channel is created
   * @param {PrivateChannel | TextChannel | VoiceChannel | CategoryChannel} channel The channel
   */
  onChannelCreate (channel) {

  }

  /**
   * Called when a channel is deleted
   * @param {PrivateChannel | TextChannel | VoiceChannel | CategoryChannel} channel The channel
   */
  onChannelDelete (channel) {

  }

  /**
   * Called when a channel pin timestamp is updated
   * @param {PrivateChannel | TextChannel} channel The channel
   * @param {Number} timestamp The new timestamp
   * @param {Number} oldTimestamp The old timestamp
   */
  onChannelPinUpdate (channel, timestamp, oldTimestamp) {

  }

  /**
   * Called when a channel is updated
   * @param {PrivateChannel | TextChannel | VoiceChannel | CategoryChannel} channel The updated channel
   * @param {Object} oldChannel The old channel data
   * @param {String} oldChannel.name The name of the channel
   * @param {Number} oldChannel.position The position of the channel
   * @param {Boolean} oldChannel.nsfw Whether the channel is NSFW or not
   * @param {String?} oldChannel.topic The topic of the channel (text channels only)
   * @param {Number?} oldChannel.bitrate The bitrate of the channel (voice channels only)
   * @param {Collection} oldChannel.permissionOverwrites Collection of PermissionOverwrites in this channel
   */
  onChannelUpdate (channel, oldChannel) {

  }
}

module.exports = ChannelEventsListener
