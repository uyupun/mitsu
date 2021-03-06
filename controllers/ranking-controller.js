const models = require('../models')
const fs = require('fs')
const ranks = JSON.parse(fs.readFileSync('public/jsons/ranks.json', 'utf-8'))

class RankingController {
  async getRanking (req, res, next) {
    const users = await models.User.findAll({
      order: [['rate', 'DESC']]
    })
    if (!users.length) return res.status(400).json({ msg: 'ランキングのしゅとくにしっぱいしました' })
    const ranking = users.slice(0, 10).map((user) => {
      return {
        userId: user.userId,
        rate: user.rate,
        image: ranks.find((rank) => rank.rate.lower <= user.rate && rank.rate.upper >= user.rate).image
      }
    })

    return res.status(200).json(ranking)
  }
}

module.exports = new RankingController()
