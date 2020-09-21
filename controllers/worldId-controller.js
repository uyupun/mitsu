const { validationResult } = require('express-validator');
const { customAlphabet } = require('nanoid');
const con = require('../libs/world-ids.js');

class WorldIdController {
  generateWorldId(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({msg: 'ぼしゅうにしっぱいしました'});
    }

    const worldId = this._generateNanoid(6);
    const token = this._generateNanoid(12);

    con.set(worldId, JSON.stringify({
      worldId: worldId,
      tokens: {
        '1': req.query.recruit == 2 ? token : null,
        '2': req.query.recruit == 1 ? token : null,
      }
    }), 'EX', process.env.WORLD_ID_TTL)

    return res.status(200).json({
      worldId: worldId,
      token: token,
    });
  }

  checkWorldId(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({msg: 'さんかにしっぱいしました'});
    }

    con.get(req.query.worldId).then((worldId) => {
      if (worldId) return res.status(200).json({validity: true});
      return res.status(200).json({validity: false});
    })
  }

  _generateNanoid(len) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const nanoid = customAlphabet(alphabet, len);
    return nanoid();
  }
};

module.exports = new WorldIdController();
