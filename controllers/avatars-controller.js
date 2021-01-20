const fs = require('fs')
const avatars = JSON.parse(fs.readFileSync('public/jsons/avatars.json', 'utf-8'))

class AvatarsController {
  getAvatars (req, res, next) {
    res.json(avatars)
  }
}

module.exports = new AvatarsController()
