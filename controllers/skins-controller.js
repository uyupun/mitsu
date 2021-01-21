const { validationResult } = require('express-validator')
const fs = require('fs')
const skins = JSON.parse(fs.readFileSync('public/jsons/skins.json', 'utf-8'))
const models = require('../models')
const { PLAYER_PEKORA, PLAYER_BAIKINKUN } = require('../libs/constants')

class SkinsController {
  getSkins (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'スキンのしゅとくにしっぱいしました' })

    const role = Number(req.query.role)
    const filteredSkins = skins.filter((skin) => skin.role === role)
    const newSkins = filteredSkins.map((skin) => {
      return {
        id: skin.id,
        name: skin.name,
        image: skin.image
      }
    })
    res.status(200).json(newSkins)
  }

  async updateSkins (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ msg: 'スキンのへんこうにしっぱいしました' })

    const user = await models.User.findOne({
      where: {
        userId: req.userId
      }
    })
    if (!user) return res.status(400).json({ msg: 'スキンのへんこうにしっぱいしました' })

    const skin = skins.find((skin) => skin.id === req.body.id)
    if (!skin || ![PLAYER_PEKORA, PLAYER_BAIKINKUN].includes(req.body.role)) return res.status(400).json({ msg: 'スキンのへんこうにしっぱいしました' })

    if (req.body.role === PLAYER_PEKORA) user.skinPekoraId = skin.id
    else user.skinBaikinkunId = skin.id
    user.save()
    return res.status(200).json({})
  }
}

module.exports = new SkinsController()
