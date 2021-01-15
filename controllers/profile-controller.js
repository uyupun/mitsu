const { validationResult } = require('express-validator')
const models = require('../models')
const fs = require('fs')
const avatars = JSON.parse(fs.readFileSync('controllers/avatars.json', 'utf-8'))

class Profile {
  async getProfile (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'プロフィールのしゅとくにしっぱいしました' })

    const user = await models.User.findOne({
      where: {
        userId: req.query.userId
      }
    })
    if (!user) return res.status(400).json({ msg: 'プロフィールのしゅとくにしっぱいしました' })

    const avatar = avatars.find((avatar) => avatar.id === user.avatarType)
    return res.status(200).json({
      avatar: avatar.image,
      rate: user.rate,
      rank: '/images', // TODO: 画像取得
      history: {
        win: user.win,
        lose: user.lose
      }
    })
  }
}

module.exports = new Profile()
