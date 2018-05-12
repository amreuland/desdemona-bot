const Core = require('./core')

module.exports = Object.assign(
  Core,
  require('./util'),
  require('./structures'),
  require('./managers')
)
