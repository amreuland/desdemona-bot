'use strict'

module.exports = Object.assign(
  require('./errors'),
  {
    CopycatUtils: require('./copycat'),
    GuildUtils: require('./guild'),
    SteamUtils: require('./steam'),
    calendarUtil: require('./calendar'),
    EventUtils: require('./events'),
    ModerationUtils: require('./moderation'),
    RoleUtils: require('./roles')
  }
)
