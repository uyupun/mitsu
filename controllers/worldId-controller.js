const { validationResult } = require('express-validator')
const { PLAYER_PEKORA, PLAYER_BAIKINKUN } = require('../libs/constants')
const world = require('../libs/world')

class WorldIdController {
  generateWorldId (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ msg: 'ぼしゅうにしっぱいしました' }) }

    const worldId = world.create()
    const recruit = Number(req.query.recruit)
    const role = recruit === PLAYER_PEKORA ? PLAYER_BAIKINKUN : PLAYER_PEKORA

    const token = world.recruit(worldId, role)
    return res.status(200).json({ worldId, token, role })
  }

  checkWorldId (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { return res.status(400).json({ msg: 'さんかにしっぱいしました' }) }

    try {
      const { role, token } = world.join(req.query.worldId)
      return res.status(200).json({ validity: true, token, role })
    } catch (e) {
      return res.status(200).json({ validity: false, token: null, role: null })
    }
  }
};

module.exports = new WorldIdController()
