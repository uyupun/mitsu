const fs = require('fs')
const avatars = JSON.parse(fs.readFileSync('controllers/avatars.json', 'utf-8'))

class AvatarsController {
  getAvatars (req, res, next) {
    res.json(avatars)
  }
}

module.exports = new AvatarsController()
