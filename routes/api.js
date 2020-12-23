const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const authController = require('../controllers/auth-controller')
const worldController = require('../controllers/world-controller')
const rulesController = require('../controllers/rules-controller')
const auth = require('../libs/auth')

/**
 * 登録
 */
router.post('/register', [
  check('userId').not().isEmpty().bail().isString().bail().custom((userId) => {
    if (userId.match(/^[0-9a-zA-Z_]+$/)) return true
    return false
  }),
  check('password').not().isEmpty().bail().isString()
], authController.register.bind(authController))

/**
 * ログイン
 */
router.post('/login', [
  check('userId').not().isEmpty().bail().isString().bail().custom((userId) => {
    if (userId.match(/^[0-9a-zA-Z_]+$/)) return true
    return false
  }),
  check('password').not().isEmpty().bail().isString()
], authController.login.bind(authController))

/**
 * ワールド情報の取得
 * 現状、本番環境での使用はできないようにしている（認証とかめんどいので）
 */
if (process.env.NODE_ENV !== 'production') { router.get('/states', worldController.states.bind(worldController)) }

/**
 * トークンの検証ミドウェア
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const verifyToken = (req, res, next) => {
  if (!auth.existsBearerScheme(req.headers.authorization)) return res.status(400).json({})
  const token = auth.extractTokenInBearerScheme(req.headers.authorization)
  auth.verifyToken(token, (err, decoded) => {
    if (err) return res.status(401).json({})
    next()
  })
}
// TODO: とりあえずテスト環境ではバイパスしている
if (process.env.NODE_ENV !== 'test') {
  router.use('/rules', verifyToken)
  router.use('/recruit', verifyToken)
  router.use('/join', verifyToken)
}

/**
 * ルールの取得
 */
router.get('/rules', rulesController.getRules.bind(rulesController))

/**
 * 募集
 */
router.get('/recruit', [
  check('role').not().isEmpty().isIn([1, 2]),
  check('isPublic').not().isEmpty().isBoolean()
], worldController.recruit.bind(worldController))

/**
 * 参加
 */
router.get('/join', [
  check('worldId').not().isEmpty().isLength({ min: 6, max: 6 })
], worldController.join.bind(worldController))

module.exports = router
