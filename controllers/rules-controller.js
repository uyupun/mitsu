const fs = require('fs');
const rules = JSON.parse(fs.readFileSync('./stores/rules.json', 'utf-8'))

module.exports = {
  getRules: (req, res, next) => {
    res.json(rules);
  }
};
