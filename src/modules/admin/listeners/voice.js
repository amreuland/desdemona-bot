'use strict'

const { Listener } = require.main.require('./sylphy')

class VoiceEventsListener extends Listener {
  constructor (...args) {
    super(...args, {
      name: 'admin:audit:voice:events',
      events: {
        'voiceChannelJoin': 'onVoiceChannelJoin',
        'voiceChannelLeave': 'onVoiceChannelLeave',
        'voiceChannelSwitch': 'onVoiceChannelSwitch',
        'voiceStateUpdate': 'onVoiceStateUpdate'
      }
    })
  }

  /**
   * Called when a guild member joins a voice channel
   * @param {Member} member The member
   * @param {CategoryChannel | TextChannel | VoiceChannel} newChannel The voice channel
   */
  onVoiceChannelJoin (member, newChannel) {

  }

  /**
   * Called when a guild member leaves a voice channel
   * @param {Member} member The member
   * @param {CategoryChannel | TextChannel | VoiceChannel} oldChannel The voice channel
   */
  onVoiceChannelLeave (member, oldChannel) {

  }

  /**
   * Called when a guild member switches voice channels
   * @param {Member} member The member
   * @param {CategoryChannel | TextChannel | VoiceChannel} newChannel The new voice channel
   * @param {CategoryChannel | TextChannel | VoiceChannel} oldChannel The old voice channel
   */
  onVoiceChannelSwitch (member, newChannel, oldChannel) {

  }

  /**
   * Called when a guild member's voice state changes
   * @param {Member} member The member
   * @param {Object} oldState The old voice state
   * @param {Boolean} oldState.mute The previous server mute status
   * @param {Boolean} oldState.deaf The previous server deaf status
   * @param {Boolean} oldState.selfMute The previous self mute status
   * @param {Boolean} oldState.selfDeaf The previous self deaf status
   */
  onVoiceStateUpdate (member, oldState) {

  }
}

module.exports = VoiceEventsListener
