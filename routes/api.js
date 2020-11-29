const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const worldController = require('../controllers/world-controller')
const rulesController = require('../controllers/rules-controller')

/**
 * ルールの取得
 */
router.get('/rules', rulesController.getRules.bind(rulesController))

/**
 * 募集
 */
router.get('/recruit', [
  check('recruit').not().isEmpty().isIn([1, 2])
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
