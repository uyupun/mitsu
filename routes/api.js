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
  check('recruit').not().isEmpty().isIn(['1', '2'])
], worldController.generateWorldId.bind(worldController))

/**
 * 参加
 */
router.get('/join', [
  check('worldId').not().isEmpty().isLength({ min: 6, max: 6 })
], worldController.checkWorldId.bind(worldController))

module.exports = router
