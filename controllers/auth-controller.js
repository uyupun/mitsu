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

  login (req, res, next) {
    console.log(req.body)
    // TODO: 照合処理
    return res.status(200).json({})
  }

  logout (req, res, next) {
    console.log(req.body)
    // TODO: トークンの削除処理
    return res.status(200).json({})
  }
}

module.exports = new AuthController()
