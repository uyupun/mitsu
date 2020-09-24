const models = require('../models');
const { Op } = require('sequelize');

class Word2vec {
  constructor() {
    this._getRecordCnt().then((cnt) => {
      this._recordCnt = cnt;
    })
  }

  fetchWord() {
    const id = this._generateRandomId(this._recordCnt);
    return models.Word2vec.findByPk(id);
  }

  fetchWords() {
    return models.Word2vec.findAll({
      where: {
        id: {
          [Op.in]: this._generateRandomIds(this._recordCnt),
        }
      }
    })
  }

  _getRecordCnt() {
    return models.Word2vec.count().then((cnt) => {
      return cnt;
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
