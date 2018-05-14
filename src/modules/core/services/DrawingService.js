'use strict'

const Canvas = require('canvas')
const Image = Canvas.Image
const path = require('path')
const fs = require('fs')
const https = require('https')

const { NaviService } = require.main.require('./lib')

const COLORS = {
  BLURPLE: '#7289DA',
  FULL_WHITE: '#FFFFFF',
  GREYPLE: '#99AAB5',
  DARK_BUT_NOT_BLACK: '#2C2F33',
  NOT_QUITE_BLACK: '#23272A'
}

const PROGRESSBAR_LEVEL_WIDTH = 344
const PROGRESSBAR_LEVEL_HEIGHT = 18

const PROGRESSBAR_LEVEL_X = 143
const PROGRESSBAR_LEVEL_Y1 = 125
const PROGRESSBAR_LEVEL_Y2 = 242


const fontFile = name => path.join(process.cwd(), 'res', 'fonts', name)
const imageFile = name => path.join(process.cwd(), 'res', 'images', name)

class DrawingService extends NaviService {
  constructor (...args) {
    super(...args, { name: 'Drawing' })

    Canvas.registerFont(fontFile('WhitneyBold.ttf'), { family: 'Whitney', weight: 'bold' })
    Canvas.registerFont(fontFile('Bangers-Regular.ttf'), { family: 'Bangers' })
  }

  async drawUserRankCard (user, stats) {

    let img = new Image()
    img.src = fs.readFileSync(imageFile('cards/card-rank.png'))

    let canvas = Canvas.createCanvas(img.width, img.height)
    let ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0, img.width, img.height)

    this._drawProgressBar({
      ctx,
      x: PROGRESSBAR_LEVEL_X,
      y: PROGRESSBAR_LEVEL_Y1,
      width: PROGRESSBAR_LEVEL_WIDTH,
      height: PROGRESSBAR_LEVEL_HEIGHT,
      fill: COLORS.BLURPLE,
      color: COLORS.FULL_WHITE,
      current: 2048,
      max: 4096
    })

    this._drawProgressBar({
      ctx,
      x: PROGRESSBAR_LEVEL_X,
      y: PROGRESSBAR_LEVEL_Y2,
      width: PROGRESSBAR_LEVEL_WIDTH,
      height: PROGRESSBAR_LEVEL_HEIGHT,
      fill: COLORS.BLURPLE,
      color: COLORS.FULL_WHITE,
      current: 2048,
      max: 4096
    })

    let usernameText = `${user.username}#${user.discriminator}`

    ctx.font = '30px Whitney Bold'
    ctx.fillStyle = COLORS.FULL_WHITE
    ctx.textBaseline = 'top'
    ctx.fillText(usernameText, 90, 10, 400)


    let userImg = await loadImage(user.avatarURL)

    ctx.arc(45, 45, 33, 0, 2 * Math.PI, true)
    ctx.clip()

    ctx.drawImage(userImg, 10, 10, 70, 70)

    return canvas.toBuffer()
  }

  _drawProgressBar (options = {}) {
    const { ctx, x, y, width, height, fill, color, current, max } = options
    let radius = height / 2
    let leftCurveX = x + radius
    let curveY = y + radius

    let progress = width * (current / max)

    let a = (progress < radius) ? (radius - progress) : 0

    let angle = Math.acos(a / radius)

    ctx.beginPath()
    ctx.fillStyle = fill
    ctx.arc(leftCurveX, curveY, radius, Math.PI + angle, Math.PI - angle, true)

    if (a === 0) {
      let b = radius - (width - progress)

      if (b > 0) {
        let rightCurveX = x + width - radius
        angle = Math.asin(b / radius)
        ctx.arc(rightCurveX, curveY, radius, 0.5 * Math.PI, 0.5 * Math.PI - angle, true)
        ctx.arc(rightCurveX, curveY, radius, 1.5 * Math.PI + angle, 1.5 * Math.PI, true)
      } else {
        let s = x + progress - radius
        ctx.lineTo(s, curveY + radius)
        ctx.lineTo(s, curveY - radius)
      }
    }

    ctx.closePath()
    ctx.fill()

    let text = `${current} / ${max}`

    ctx.font = `${height}px Whitney Bold`
    ctx.fillStyle = color
    let textWidth = ctx.measureText(text)
    let textX = x + (width / 2) - (textWidth.width / 2)
    let textY = y + (height - 2)
    ctx.fillText(text, textX, textY)
  }
}

module.exports = DrawingService


const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url)
      .on('response', res => {
        var chunks = []
        res.on('data', data => {
          chunks.push(data)
        })
        res.on('end', () => {
          var img = new Image()
          img.src = Buffer.concat(chunks)
          return resolve(img)
        })

      })
      .on('error', err => {
        return reject(err)
      })
  })
}
