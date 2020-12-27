const { validationResult } = require('express-validator')
const { PLAYER_PEKORA, PLAYER_BAIKINKUN } = require('../libs/constants')
const world = require('../libs/world')

class WorldController {
  recruit (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'ぼしゅうにしっぱいしました' })

    const isPublic = req.query.isPublic === 'true'
    const worldId = world.create(isPublic)
    const role = Number(req.query.role) === PLAYER_PEKORA ? PLAYER_BAIKINKUN : PLAYER_PEKORA

    try {
      world.recruit(worldId, role, req.userId)
      return res.status(200).json({ worldId, role })
    } catch (e) {
      return res.status(400).json({ msg: 'ぼしゅうにしっぱいしました' })
    }
  }

  join (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'さんかにしっぱいしました' })

    try {
      const role = world.join(req.query.worldId, req.userId)
      return res.status(200).json({ role })
    } catch (e) {
      return res.status(400).json({ msg: 'さんかにしっぱいしました' })
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
