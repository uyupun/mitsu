const express = require('express');
const router = express.Router();
const worldIdController = require('../controllers/worldIdController');

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
 * TODO: 実装する
 */
router.get('/rules', setCommonConfigs, (req, res, next) => {
  res.json({})
});

/**
 * ワールドIDの取得
 */
router.get('/worldId', setCommonConfigs, worldIdController.generateWorldId);

module.exports = router;
