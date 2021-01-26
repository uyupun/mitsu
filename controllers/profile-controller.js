const { validationResult } = require('express-validator')
const models = require('../models')
const fs = require('fs')
const avatars = JSON.parse(fs.readFileSync('public/jsons/avatars.json', 'utf-8'))
const ranks = JSON.parse(fs.readFileSync('public/jsons/ranks.json', 'utf-8'))

class ProfileController {
  async getProfile (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'プロフィールのしゅとくにしっぱいしました' })

    const user = await models.User.findOne({
      where: {
        userId: req.query.userId
      }
    })
    if (!user) return res.status(400).json({ msg: 'プロフィールのしゅとくにしっぱいしました' })

    const avatar = avatars.find((avatar) => avatar.id === user.avatarId)
    const rank = ranks.find((rank) => rank.rate.lower <= user.rate && rank.rate.upper >= user.rate)
    return res.status(200).json({
      avatarId: user.avatarId,
      avatar: avatar.image,
      rate: user.rate,
      rank: rank.image,
      history: {
        win: user.win,
        lose: user.lose
      },
      skin: {
        usagisanId: user.skinPekoraId,
        baikinkunId: user.skinBaikinkunId
      }
    })
  }

  async updateProfile (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'プロフィールのへんこうにしっぱいしました' })

    const user = await models.User.findOne({
      where: {
        userId: req.userId
      }
    })
    if (!user) return res.status(400).json({ msg: 'プロフィールのへんこうにしっぱいしました' })

    const avatar = avatars.find((avatar) => avatar.id === req.body.avatarId)
    if (!avatar) return res.status(400).json({ msg: 'プロフィールのへんこうにしっぱいしました' })
    user.avatarId = avatar.id
    user.save()
    return res.status(200).json({})
  }
}

module.exports = new ProfileController()
