const { validationResult } = require('express-validator')
const auth = require('../libs/auth')
const models = require('../models')

class AuthController {
  async register (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'とうろくにしっぱいしました' })

    const hashedPassword = auth.hashPassword(req.body.password)
    const [user, created] = await models.User.findOrCreate({
      where: { userId: req.body.userId },
      defaults: {
        userId: req.body.userId,
        password: hashedPassword
      }
    })
    const token = auth.generateToken(user.dataValues.userId)
    if (created) {
      return res.status(200).json({
        token
      })
    } else return res.status(400).json({ msg: 'とうろくにしっぱいしました' })
  }

  async login (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'ログインにしっぱいしました' })

    const user = await models.User.findOne({
      where: {
        userId: req.body.userId
      }
    })
    if (!user) return res.status(400).json({ msg: 'ログインにしっぱいしました' })
    if (!auth.verifyPassword(req.body.password, user.dataValues.password)) return res.status(400).json({})
    const token = auth.generateToken(user.dataValues.userId)
    return res.status(200).json({
      token
    })
  }
}

module.exports = new AuthController()
