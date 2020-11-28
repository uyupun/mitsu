const word2vec = require('./word2vec')
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN
} = require('./constants')

class Word {
  constructor () {
    this._words = []
    this._baseWords = {
      [PLAYER_PEKORA]: null,
      [PLAYER_BAIKINKUN]: null
    }
    this._initBaseWords()
  }

  /**
   * ベースとなる単語の初期化
   * async/awaitがconstructorで使えないのでこういった実装になっている
   */
  async _initBaseWords () {
    this._baseWords = {
      [PLAYER_PEKORA]: await word2vec.fetchFirstWord(),
      [PLAYER_BAIKINKUN]: await word2vec.fetchFirstWord()
    }
  }

  /**
   * 単語の選択肢の取得
   *
   * @param {*} role
   */
  async getWords (role) {
    this._words = await word2vec.fetchWords(this._baseWords[role])
    return this._words
  }

  /**
   * ランダムな単語の取得
   */
  getRandomWord () {
    const len = this._words.length
    const idx = Math.floor(Math.random() * len)
    const word = this._words[idx]
    return word
  }

  /**
   * ベースとなる単語の取得
   */
  getBaseWord (role) {
    return this._baseWords[role]
  }

  /**
   * ベースとなる単語の設定
   *
   * @param {*} role
   * @param {*} baseWord
   */
  setBaseWord (role, baseWord) {
    this._baseWords[role] = baseWord
  }
}

module.exports = Word
