'use strict'

module.exports = {
  name: 'addSettings',
  priority: 0,
  process: container => {
    container.settings = (container.settings ? container.settings : {})
    return Promise.resolve(container)
  }
}
