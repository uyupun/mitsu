const { validationResult } = require('express-validator')
const { PLAYER_PEKORA, PLAYER_BAIKINKUN } = require('../libs/constants')
const world = require('../libs/world')

class WorldController {
  recruit (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ msg: 'ぼしゅうにしっぱいしました' }) }

    const worldId = world.create(req.query.isPublic)
    const role = Number(req.query.role) === PLAYER_PEKORA ? PLAYER_BAIKINKUN : PLAYER_PEKORA

    const token = world.recruit(worldId, role)
    return res.status(200).json({ worldId, token, role })
  }

  join (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ msg: 'さんかにしっぱいしました' }) }

    try {
      const { role, token } = world.join(req.query.worldId)
      return res.status(200).json({ validity: true, token, role })
    } catch (e) {
      return res.status(200).json({ validity: false, token: null, role: null })
    }
  }

  /**
   * ワールド情報の取得
   * 現状、本番環境での使用はできないようにしている（認証とかめんどいので）
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  states (req, res, next) {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({})
    const states = world.states
    return res.status(200).json(states)
  }
};

module.exports = new WorldController()
