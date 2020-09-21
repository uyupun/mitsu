const { validationResult } = require('express-validator');
const { customAlphabet } = require('nanoid');
const con = require('../libs/world-ids.js');

module.exports = {
  generateWorldId: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({msg: 'ぼしゅうにしっぱいしました'});
    }

    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const nanoid = customAlphabet(alphabet, 6);
    const worldId = nanoid();

    con.set(worldId, req.query.recruit, 'EX', process.env.WORLD_ID_TTL)

    return res.status(200).json({worldId: worldId});
  },

  checkWorldId: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({msg: 'さんかにしっぱいしました'});
    }

    con.get(req.query.worldId).then((worldId) => {
      if (worldId) return res.status(200).json({validity: true});
      return res.status(200).json({validity: false});
    })
  }
};
