const models = require('../models')
const { Op } = require('sequelize')
const { WORD_COUNT } = require('./constants')

class Word2vec {
  constructor () {
    this._getRecordCnt().then((cnt) => {
      this._recordCnt = cnt
    })
  }

  /**
   * 最初の一単語目の取得
   */
  fetchFirstWord () {
    const id = this._generateRandomId(this._recordCnt)
    return models.Word2vec.findByPk(id, { raw: true })
  }

  /**
   * 単語の選択肢の取得
   *
   * @param {*} baseWord
   */
  async fetchWords (baseWord) {
    const words = await models.Word2vec.findAll({
      raw: true,
      where: {
        id: {
          [Op.in]: this._generateRandomIds(this._recordCnt)
        }
      }
    })
    return this._calcDirections(baseWord, words)
  }

  /**
   * レコード数の計算
   */
  async _getRecordCnt () {
    return await models.Word2vec.count()
  }

  /**
   * 単語の選択肢の数だけレコード数の範囲内でランダムな数を生成する
   * ランダムに単語を取得する際に使用する
   *
   * @param {*} limit
   */
  _generateRandomIds (limit) {
    const ids = []
    for (let i = 0; i < WORD_COUNT; i++) {
      ids.push(this._generateRandomId(limit))
    }
    return ids
  }

  /**
   * レコード数の範囲内でランダムな数を生成する
   *
   * @param {*} limit
   */
  _generateRandomId (limit) {
    const id = Math.ceil(Math.random() * limit)
    return id
  }

  /**
   * 現在選択中の単語と比較して大まかにどの方向へ移動するかの計算
   *
   * @param {*} baseWord
   * @param {*} words
   */
  _calcDirections (baseWord, words) {
    for (let i = 0; i < WORD_COUNT; i++) {
      const direction = {
        top_right: false,
        top_left: false,
        bottom_left: false,
        bottom_right: false
      }
      if (words[i].move_x > baseWord.move_x) {
        if (words[i].move_y > baseWord.move_y) direction.bottom_right = true
        else direction.top_right = true
      } else if (words[i].move_y > baseWord.move_y) direction.bottom_left = true
      else direction.top_left = true
      words[i].direction = direction
    }
    return words
  }
}

module.exports = new Word2vec()
