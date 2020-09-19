const { customAlphabet } = require('nanoid');
const con = require('../databases/player-connections.js');

module.exports = {
  generateWorldId: (req, res, next) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const nanoid = customAlphabet(alphabet, 6);
    const worldId = nanoid();

    con.set(worldId, req.query.recruit);

    res.json({worldId: worldId});
  }
};
