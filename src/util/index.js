'use strict'

module.exports = Object.assign(
  require('./errors'),
  {
    CopycatUtils: require('./copycat'),
    SteamUtils: require('./steam'),
    calendarUtil: require('./calendar'),
    EventUtils: require('./events'),
    RoleUtils: require('./roles')
  }
)
