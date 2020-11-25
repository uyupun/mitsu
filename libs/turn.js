const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN
} = require('./constants')

class Turn {
  constructor () {
    this._count = 1
    this._second = 30
    this._timer = null
  }

  /**
   * ターン数の取得
   */
  get count () {
    return this._count
  }

  /**
   * ターン数を進める
   */
  increment () {
    ++this._count
  }

  /**
   * ターンの残り秒数のカウントダウン
   */
  countdown (callback) {
    this._clearCountdownTimer()
    const countdown = () => {
      if (this._second < 0) return
      callback(this._second)
      --this._second
      this._timer = setTimeout(countdown, 1000)
    }
    countdown()
  }

  /**
   * カウントダウンタイマーの開放
   */
  _clearCountdownTimer () {
    if (this._timer != null) clearTimeout(this._timer)
    this._second = 30
  }

  /**
   * 現在攻撃ターンにあるプレイヤーの取得
   */
  get currentPlayer () {
    if (this.count % 2 === 1) return PLAYER_PEKORA
    return PLAYER_BAIKINKUN
  }
}

module.exports = Turn
