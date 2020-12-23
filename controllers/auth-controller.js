const auth = require('../libs/auth')
const models = require('../models')

class AuthController {
  async register (req, res, next) {
    const hashedPassword = auth.hashPassword(req.body.password)
    const [user, created] = await models.User.findOrCreate({
      where: { user_id: req.body.userId },
      defaults: {
        user_id: req.body.userId,
        password: hashedPassword
      }
    })
    const token = auth.generateToken(user.dataValues.user_id)
    if (created) {
      return res.status(200).json({
        token
      })
    } else return res.status(400).json({})
  }

  async login (req, res, next) {
    const user = await models.User.findOne({
      where: {
        user_id: req.body.userId
      }
    })
    if (!user) return res.status(400).json({})
    if (!auth.verifyPassword(req.body.password, user.dataValues.password)) return res.status(400).json({})
    const token = auth.generateToken(user.dataValues.user_id)
    return res.status(200).json({
      token
    })
  }
}

module.exports = new AuthController()
