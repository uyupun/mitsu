class AuthController {
  register (req, res, next) {
    console.log(req.body.userId)
    console.log(req.body.password)
    // TODO: 登録処理
    return res.status(200).json({})
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
