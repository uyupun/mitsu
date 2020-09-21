const fs = require('fs');
const rules = JSON.parse(fs.readFileSync('./stores/rules.json', 'utf-8'))

class RulesController {
  getRules(req, res, next) {
    res.json(rules);
  }
}

module.exports = new RulesController();
