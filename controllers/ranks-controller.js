const fs = require('fs')
const ranks = JSON.parse(fs.readFileSync('public/jsons/ranks.json', 'utf-8'))

class RanksController {
  getRanks (req, res, next) {
    res.json(ranks)
  }
}

module.exports = new RanksController()
