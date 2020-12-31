const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

class Auth {
  constructor () {
    this._secretKey = fs.readFileSync(path.join(__dirname, '/../jwt_secret_key'), 'utf-8')
  }

  /**
   * BCrypt(Blowfish暗号)によるパスワードのハッシュ化
   *
   * @param {*} password
   */
  hashPassword (password) {
    const round = 10
    const salt = bcrypt.genSaltSync(round)
    const hashedPassword = bcrypt.hashSync(password, salt)
    return hashedPassword
  }

  /**
   * パスワードの検証
   *
   * @param {*} password
   * @param {*} hashedPassword
   */
  verifyPassword (password, hashedPassword) {
    const isCorrect = bcrypt.compareSync(password, hashedPassword)
    if (isCorrect) return true
    return false
  }

  /**
   * トークンの生成
   *
   * @param {*} userId
   */
  generateToken (userId) {
    const payload = {
      userId
    }
    const option = {
      algorithm: 'HS256',
      expiresIn: '30days'
    }
    const token = jwt.sign(payload, this._secretKey, option)
    return token
  }

  /**
   * トークンの検証
   *
   * @param {*} token
   * @param {*} callback
   */
  verifyToken (token, callback) {
    jwt.verify(token, this._secretKey, (err, decoded) => {
      callback(err, decoded)
    })
  }

  /**
   * トークンのペイロード部分をデコードして返す
   *
   * @param {*} token
   */
  getTokenPayload (token) {
    const payload = jwt.decode(token, { complete: true }).payload
    return payload
  }

  /**
   * Bearerスキームの存在チェック
   *
   * @param {*} authorization
   */
  existsBearerScheme (authorization) {
    if (!authorization) return false
    if (authorization.split(' ')[0] !== 'Bearer') return false
    return true
  }

  /**
   * Bearerスキームからトークンを取り出す
   *
   * @param {*} authorization
   */
  extractTokenInBearerScheme (authorization) {
    const token = authorization.split(' ')[1]
    return token
  }
}

module.exports = new Auth()
