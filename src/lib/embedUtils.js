'use strict'

const R = require('ramda')
const moment = require('moment')

const descFunc = R.compose(R.join('\n'), R.difference)
const paramsFunc1 = R.filter(
  R.compose(
    R.test(/^\$[A-Za-z0-9]+::[A-Za-z0-9 :/.]+$/),
    R.trim
  )
)
const paramsFunc2 = R.compose(
  R.converge(
    R.zipObj, [
      R.compose(
        R.map(
          R.compose(
            R.toLower,
            R.replace(/\$/, '')
          )
        ),
        R.prop(0)
      ),
      R.compose(
        R.map(R.toLower),
        R.prop(1)
      )
    ]
  ),
  R.transpose,
  R.map(R.split('::'))
)

module.exports = {

}
