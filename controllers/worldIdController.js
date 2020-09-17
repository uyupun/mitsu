const { customAlphabet } = require('nanoid');

module.exports = {
  generateWorldId: (req, res, next) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const nanoid = customAlphabet(alphabet, 6);
    const worldId = nanoid();
    res.json({worldId: worldId});
  }
};
