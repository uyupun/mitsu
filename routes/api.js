const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const worldIdController = require('../controllers/worldIdController');
const rulesController = require('../controllers/rulesController');

/**
 * ルールの取得
 */
router.get('/rules', rulesController.getRules);

/**
 * ワールドIDの取得
 */
router.get('/worldId', [
  check('recruit').not().isEmpty().isIn(['1', '2'])
], worldIdController.generateWorldId);

/**
 * ワールドIDの正当性を確認
 */
router.get('/worldId/check', [
  check('worldId').not().isEmpty().isLength({min: 6, max: 6})
], worldIdController.checkWorldId);

module.exports = router;
