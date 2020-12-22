const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const authController = require('../controllers/auth-controller')
const worldController = require('../controllers/world-controller')
const rulesController = require('../controllers/rules-controller')

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

/**
 * ワールド情報の取得
 * 現状、本番環境での使用はできないようにしている（認証とかめんどいので）
 */
if (process.env.NODE_ENV !== 'production') { router.get('/states', worldController.states.bind(worldController)) }

module.exports = router
