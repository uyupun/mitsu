const express = require('express');
const router = express.Router();
const worldIdController = require('../controllers/worldIdController');
const rulesController = require('../controllers/rulesController');

/**
 * 共通処理の設定
 * TODO: ここらへんもミドルウェアとして分けたさあるな🤔
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const setCommonConfigs = (req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
}

/**
 * ルールの取得
 */
router.get('/rules', setCommonConfigs, rulesController.getRules);

/**
 * ワールドIDの取得
 */
router.get('/worldId', setCommonConfigs, worldIdController.generateWorldId);

module.exports = router;
