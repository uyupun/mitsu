const express = require('express');
const router = express.Router();

/**
 * 共通処理の設定
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
router.get('/rules', setCommonConfigs, (req, res, next) => {
  res.json({})
});

/**
 * ワールドIDの取得
 */
router.get('/worldId', (req, res, next) => {
  res.json({})
});

module.exports = router;