const models = require('../models');
const { Op } = require('sequelize');

class Word2vec {
  fetchWords() {
    return this._getRecordCnt()
      .then((ids) => {
        return models.Word2vec.findAll({
          where: {
            id: {
              [Op.in]: ids,
            }
          }
        })
      })
  }

  _getRecordCnt() {
    return models.Word2vec.count().then((cnt) => {
      const ids = this._generateRandomIds(cnt)
      return ids;
    });
  }

  _generateRandomIds(limit) {
    const ids = [];
    for (let i = 0; i < 8; i++) {
      ids.push(this._generateRandomId(limit));
    }
    return ids;
  }

  _generateRandomId(limit) {
    const id = Math.ceil(Math.random() * limit);
    return id;
  }
}

module.exports = new Word2vec();
