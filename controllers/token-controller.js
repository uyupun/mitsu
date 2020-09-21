const { customAlphabet } = require('nanoid');

module.exports = {
  generateToken: (req, res, next) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const nanoid = customAlphabet(alphabet, 12);
    const token = nanoid();
    return res.status(200).json({token: token});
  }
};
