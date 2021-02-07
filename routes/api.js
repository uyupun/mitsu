const express = require('express')
const router = express.Router()
const { query, body } = require('express-validator')
const authController = require('../controllers/auth-controller')
const worldController = require('../controllers/world-controller')
const rulesController = require('../controllers/rules-controller')
const avatarsController = require('../controllers/avatars-controller')
const ranksController = require('../controllers/ranks-controller')
const profileController = require('../controllers/profile-controller')
const rankingController = require('../controllers/ranking-controller')
const skinsController = require('../controllers/skins-controller')
const InquiryController = require('../controllers/inquiry-controller')
const auth = require('../libs/auth')

/**
 * 登録
 */
router.post('/register', [
  body('userId').not().isEmpty().bail().isString().bail().custom((userId) => {
    if (userId.match(/^[0-9a-zA-Z_]+$/)) return true
    return false
  }),
  body('password').not().isEmpty().bail().isString()
], authController.register.bind(authController))

/**
 * ログイン
 */
router.post('/login', [
  body('userId').not().isEmpty().bail().isString().bail().custom((userId) => {
    if (userId.match(/^[0-9a-zA-Z_]+$/)) return true
    return false
  }),
  body('password').not().isEmpty().bail().isString()
], authController.login.bind(authController))

/**
 * ワールド情報の取得
 * 現状、本番環境での使用はできないようにしている（認証とかめんどいので）
 */
if (process.env.NODE_ENV !== 'production') router.get('/states', worldController.states.bind(worldController))

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
    const userId = auth.getTokenPayload(token).userId
    req.userId = userId
    next()
  })
}

/**
 * ルールの取得
 */
router.get('/rules', verifyToken, rulesController.getRules.bind(rulesController))

/**
 * 募集
 */
router.get('/recruit', [
  verifyToken,
  query('role').not().isEmpty().bail().isIn([1, 2]),
  query('isPublic').not().isEmpty().bail().isBoolean()
], worldController.recruit.bind(worldController))

/**
 * 参加
 */
router.get('/join', [
  verifyToken,
  query('worldId').not().isEmpty().bail().isLength({ min: 6, max: 6 })
], worldController.join.bind(worldController))

/**
 * 検索
 */
router.get('/search', [
  verifyToken,
  query('page').not().isEmpty().bail().isInt({ min: 1 }),
  query('limit').not().isEmpty().bail().isInt({ min: 1, max: 20 })
], worldController.search.bind(worldController))

/**
 * アバターの取得
 */
router.get('/avatars', verifyToken, avatarsController.getAvatars.bind(avatarsController))

/**
 * ランクの取得
 */
router.get('/ranks', verifyToken, ranksController.getRanks.bind(ranksController))

/**
 * プロフィールの取得
 */
router.get('/profile', [
  verifyToken,
  query('userId').not().isEmpty().bail().custom((userId) => {
    if (userId.match(/^[0-9a-zA-Z_]+$/)) return true
    return false
  })
], profileController.getProfile.bind(profileController))

/**
 * プロフィールの変更
 */
router.patch('/profile', [
  verifyToken,
  body('avatarId').not().isEmpty().bail().isInt({ min: 1, max: 5 })
], profileController.updateProfile.bind(profileController))

/**
 * ランキングの取得
 */
router.get('/ranking', verifyToken, rankingController.getRanking.bind(rankingController))

/**
 * スキンの取得
 */
router.get('/skins', [
  verifyToken,
  query('role').not().isEmpty().bail().isIn([1, 2])
], skinsController.getSkins.bind(skinsController))

/**
 * スキンの取得
 */
router.patch('/skins', [
  verifyToken,
  body('id').not().isEmpty().bail().isInt({ min: 1, max: 6 }),
  body('role').not().isEmpty().bail().isIn([1, 2])
], skinsController.updateSkins.bind(skinsController))

/**
 * 問い合わせ
 */
router.post('/inquiry', [
  verifyToken,
  body('content').not().isEmpty().bail().isString().bail().isLength({ min: 1, max: 1000 }),
  body('email').not().isEmpty().bail().isEmail(),
  body('categoryId').not().isEmpty().bail().isInt()
], InquiryController.inquire.bind(InquiryController))

module.exports = router
