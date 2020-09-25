const models = require('../models');
const { Op } = require('sequelize');
const { WORD_COUNT } = require('./constants');

class Word2vec {
  constructor() {
    this._getRecordCnt().then((cnt) => {
      this._recordCnt = cnt;
    })
  }

  fetchFirstWord() {
    const id = this._generateRandomId(this._recordCnt);
    return models.Word2vec.findByPk(id, {raw: true});
  }

  fetchWords(baseWord) {
    return models.Word2vec.findAll({
      raw: true,
      where: {
        id: {
          [Op.in]: this._generateRandomIds(this._recordCnt),
        }
      }
    }).then((words) => {
      return this._calcDirections(baseWord, words)
    })
  }

  _getRecordCnt() {
    return models.Word2vec.count().then((cnt) => {
      return cnt;
    });
  }

  _generateRandomIds(limit) {
    const ids = [];
    for (let i = 0; i < WORD_COUNT; i++) {
      ids.push(this._generateRandomId(limit));
    }
    return ids;
  }

  _generateRandomId(limit) {
    const id = Math.ceil(Math.random() * limit);
    return id;
  }

  _calcDirections(baseWord, words) {
    for (let i = 0; i < WORD_COUNT; i++) {
      const direction = {
        top_right: false,
        top_left: false,
        bottom_left: false,
        bottom_right: false,
      };
      if (words[i].move_x > baseWord.move_x) {
        if (words[i].move_y > baseWord.move_y) direction.bottom_right = true;
        else direction.top_right = true;
      } else if (words[i].move_y > baseWord.move_y) direction.bottom_left = true;
      else direction.top_left = true;
      words[i].direction = direction;
    }
    return words;
  }
}

module.exports = new Word2vec();
