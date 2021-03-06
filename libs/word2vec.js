const models = require('../models')
const { Op } = require('sequelize')
const { WORD_COUNT } = require('./constants')

class Word2vec {
  /**
   * 最初の一単語目の取得
   */
  async fetchFirstWord () {
    const records = await models.Word2vec.count()
    const id = Word2vec._generateRandomId(records)
    const word = await models.Word2vec.findByPk(id, { raw: true })
    return word
  }

  /**
   * 単語の選択肢の取得
   *
   * @param {*} baseWord
   */
  async fetchWords (baseWord) {
    const records = await models.Word2vec.count()
    const words = await models.Word2vec.findAll({
      raw: true,
      where: {
        id: {
          [Op.in]: Word2vec._generateRandomIds(records)
        }
      }
    })
    return Word2vec._calcDirections(baseWord, words)
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
  static _generateRandomIds (limit) {
    const ids = []
    for (let i = 0; i < WORD_COUNT; i++) {
      ids.push(Word2vec._generateRandomId(limit))
    }
    return ids
  }

  /**
   * レコード数の範囲内でランダムな数を生成する
   *
   * @param {*} limit
   */
  static _generateRandomId (limit) {
    const id = Math.ceil(Math.random() * limit)
    return id
  }

  /**
   * 現在選択中の単語と比較して大まかにどの方向へ移動するかの計算
   *
   * @param {*} baseWord
   * @param {*} words
   */
  static _calcDirections (baseWord, words) {
    for (let i = 0; i < WORD_COUNT; i++) {
      const direction = {
        top_right: false,
        top_left: false,
        bottom_left: false,
        bottom_right: false
      }
      if (words[i].moveX > baseWord.moveX) {
        if (words[i].moveY > baseWord.moveY) direction.bottom_right = true
        else direction.top_right = true
      } else if (words[i].moveY > baseWord.moveY) direction.bottom_left = true
      else direction.top_left = true
      words[i].direction = direction
    }
    return words
  }
}

module.exports = new Word2vec()
