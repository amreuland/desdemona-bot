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

function getParameters (event) {
  let lines = (event.description || '').split('\n')

  let params = paramsFunc1(lines)

  if (params.length < 1) {
    return null
  }

  let description = descFunc(lines, params)

  params = paramsFunc2(params)

  params.title = params.title || event.summary
  params.url = event.htmlLink
  params.description = description
  params.eventId = event.id
  params.startDateTime = moment(event.start.dateTime).toDate()
  params.endDateTime = moment(event.end.dateTime).toDate()

  return params
}

function createEmbed (params) {
  if (!params) {
    return null
  }

  return {
    title: params.title,
    author: {
      name: 'Navi - Calendar',
      url: 'https://github.com/noriah/navi-bot',
      icon_url: 'https://discordapp.com/assets/644ab12f2f874b0c5fb5b5b5f88a0bef.svg'
    },
    url: params.url,
    description: params.description,
    footer: {
      text: 'Event'
    },
    color: 0xdf3939,
    timestamp: params.startDateTime
  }
}

module.exports = {
  getParameters,
  createEmbed
}
