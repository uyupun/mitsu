const { validationResult } = require('express-validator')
const fs = require('fs')
const skins = JSON.parse(fs.readFileSync('public/jsons/skins.json', 'utf-8'))

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
}

module.exports = new SkinsController()
