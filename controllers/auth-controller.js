const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const models = require('../models')

class AuthController {
  register (req, res, next) {
    const round = 10
    const hash = bcrypt.hashSync(req.body.password, round)
    models.User.findOrCreate({
      where: { user_id: req.body.userId },
      defaults: {
        user_id: req.body.userId,
        password: hash
      }
    }).then(([user, created]) => {
      const payload = {
        userId: req.body.userId
      }
      const secretKey = fs.readFileSync(path.join(__dirname, '/../jwt_secret_key'), 'utf-8')
      const option = {
        algorithm: 'HS256',
        expiresIn: '30days'
      }
      const token = jwt.sign(payload, secretKey, option)
      if (created) {
        return res.status(200).json({
          token
        })
      } else return res.status(400).json({})
    })
  }

  async login (req, res, next) {
    const user = await models.User.findOne({
      where: {
        user_id: req.body.userId
      }
    })
    if (!user) return res.status(400).json({})

    // TODO: パスワードの検証
    console.log(user.dataValues.password)

    const payload = {
      userId: req.body.userId
    }
    const secretKey = fs.readFileSync(path.join(__dirname, '/../jwt_secret_key'), 'utf-8')
    const option = {
      algorithm: 'HS256',
      expiresIn: '30days'
    }
    const token = jwt.sign(payload, secretKey, option)
    return res.status(200).json({
      token
    })
  }
}

module.exports = new AuthController()
