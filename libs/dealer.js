const worldStates = require('./world-states')
const word2vec = require('./word2vec')
const judge = require('./judge')
const position = require('./position')
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN,
  PLAYER_PEKORA_START_POSITION_X,
  PLAYER_PEKORA_START_POSITION_Y,
  PLAYER_BAIKINKUN_START_POSITION_X,
  PLAYER_BAIKINKUN_START_POSITION_Y
} = require('./constants')

/**
 * ゲームの進行を担当する
 */
class Dealer {
  constructor (io) {
    this._io = io

    this._worldId = ''
    this._turn = 1
    this._words = []
    this._baseWords = {
      [PLAYER_PEKORA]: null,
      [PLAYER_BAIKINKUN]: null
    }
    this._positions = {
      [PLAYER_PEKORA]: { x: 0, y: 0 },
      [PLAYER_BAIKINKUN]: { x: 0, y: 0 }
    }
    this._timer = ''
    this._second = 30
    this._disconnected = false
  }

  /**
   * 起点となるイベントの起動
   *
   * @param {*} socket
   * @param {*} payload
   */
  entry (socket, payload) {
    this._join(socket, payload)
    this._attackListener(socket)
    this._leaveWorldListener(socket)
    this._disconnectListener(socket)
  }

  /**
   * ワールドにJoinする
   *
   * @param {*} socket
   * @param {*} payload
   */
  async _join (socket, payload) {
    if (this._disconnected) return socket.emit('notice_disconnect', {})
    const isValid = await worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
    if (!isValid) return this._invalidPlayerEmitter(socket)
    this._worldId = payload.worldId
    socket.join(this._worldId)
    this._setup(socket, payload.role)
  }

  /**
   * ゲームの開始処理
   */
  async _setup (socket, requestPlayer) {
    await this._io.of('/').in(this._worldId).clients(async (_, clients) => {
      if (clients.length !== 2) return
      this._baseWords[PLAYER_PEKORA] = await word2vec.fetchFirstWord()
      this._baseWords[PLAYER_BAIKINKUN] = await word2vec.fetchFirstWord()
      this._feedbackPositionEmitter(PLAYER_PEKORA_START_POSITION_X, PLAYER_PEKORA_START_POSITION_Y, PLAYER_PEKORA)
      this._feedbackPositionEmitter(PLAYER_BAIKINKUN_START_POSITION_X, PLAYER_BAIKINKUN_START_POSITION_Y, PLAYER_BAIKINKUN)
      this._getWordsAndBaseWordEmitter(PLAYER_PEKORA)
      this._getTurnEmitter()
      this._getCountdownEmitter(socket, requestPlayer)
      this._declareAttackEmitter(socket, requestPlayer)
      this._declareWaitEmitter(socket, requestPlayer)
    })
  }

  /**
   * フィールド上の移動の情報を返す
   *
   * @param {*} x
   * @param {*} y
   * @param {*} player
   */
  _feedbackPositionEmitter (x, y, player) {
    this._positions[player].x = x
    this._positions[player].y = y
    this._io.to(this._worldId).emit('feedback_position', { x, y, player })
  }

  /**
   * 単語の選択肢とベースとなる単語を返す
   *
   * @param {*} player
   */
  async _getWordsAndBaseWordEmitter (player) {
    this._words = await word2vec.fetchWords(this._baseWords[player])
    this._io.to(this._worldId).emit('get_words_and_baseword', { words: this._words, baseWord: this._baseWords[player], player })
  }

  /**
   * 単語の選択肢を返す
   *
   * @param {*} player
   */
  async _getWordsEmitter (player) {
    this._words = await word2vec.fetchWords(this._baseWords[player])
    this._io.to(this._worldId).emit('get_words', { words: this._words })
  }

  /**
   * ベースとなる単語の更新
   *
   * @param {*} player
   */
  _updateBaseWordEmitter (player) {
    this._io.to(this._worldId).emit('update_baseword', { baseWord: this._baseWords[player], player })
  }

  /**
   * ターン数を返す
   */
  _getTurnEmitter () {
    this._io.to(this._worldId).emit('get_turn', { turn: this._turn })
  }

  /**
   * カウントダウン処理により、現在の残り時間を返す
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _getCountdownEmitter (socket, requestPlayer) {
    const countdown = () => {
      if (this._second < 0) return
      this._io.to(this._worldId).emit('get_countdown', { second: this._second })
      if (this._second === 0) this._declareTimeoutEmitter(socket, requestPlayer)
      this._second--
      this._timer = setTimeout(countdown, 1000)
    }
    countdown()
  }

  /**
   * カウントダウンのリセット
   */
  _resetCountdown () {
    clearTimeout(this._timer)
    this._second = 30
  }

  /**
   * 攻撃のターンであることを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _declareAttackEmitter (socket, requestPlayer) {
    const currentPlayer = this._getCurrentPlayer()
    if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.emit('declare_attack', {})
    socket.broadcast.to(this._worldId).emit('declare_attack', {})
  }

  /**
   * 待機するターンであることを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _declareWaitEmitter (socket, requestPlayer) {
    const currentPlayer = this._getCurrentPlayer()
    if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.broadcast.to(this._worldId).emit('declare_wait', {})
    socket.emit('declare_wait', {})
  }

  /**
   * 勝利判定
   *
   * @param {*} player
   */
  _judgeEmitter (player) {
    this._io.to(this._worldId).emit('judge', { winner: player })
  }

  /**
   * 正当なプレイヤーでない場合
   *
   * @param {*} socket
   */
  _invalidPlayerEmitter (socket) {
    socket.emit('invalid_player', {})
  }

  /**
   * タイムアウトしたことを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _declareTimeoutEmitter (socket, requestPlayer) {
    this._resetCountdown()
    const randomIndex = Math.floor(Math.random() * this._words.length)
    const word = this._words[randomIndex]
    const currentPlayer = this._getCurrentPlayer()
    if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.emit('declare_timeout', { word })
    socket.broadcast.to(this._worldId).emit('declare_timeout', { word })
  }

  /**
   * 攻撃処理
   *
   * @param {*} socket
   */
  async _attackListener (socket) {
    await socket.on('attack', async (payload) => {
      const isValid = await worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
      if (!isValid) return this._invalidPlayerEmitter(socket)
      this._resetCountdown()
      const { x, y } = position.depart(this._positions[payload.role].x, this._positions[payload.role].y, payload.baseWord)
      this._feedbackPositionEmitter(x, y, payload.role)
      if (judge.isHit(this._positions[PLAYER_PEKORA], this._positions[PLAYER_BAIKINKUN])) {
        this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
        this._judgeEmitter(PLAYER_BAIKINKUN)
        return
      } else if (judge.isGoal(this._positions[PLAYER_PEKORA].x)) {
        this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
        this._judgeEmitter(PLAYER_PEKORA)
        return
      }
      ++this._turn
      this._getTurnEmitter()
      this._baseWords[payload.role] = payload.baseWord
      this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
      this._turn <= 2
        ? this._getWordsAndBaseWordEmitter(PLAYER_BAIKINKUN)
        : this._getWordsEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
      this._declareAttackEmitter(socket, payload.role)
      this._declareWaitEmitter(socket, payload.role)
      this._getCountdownEmitter(socket, payload.role)
    })
  }

  /**
   * 切断
   *
   * @param {*} socket
   */
  async _leaveWorldListener (socket) {
    await socket.on('leave_world', async (payload) => {
      const isDeleted = await worldStates.delete(payload.worldId, payload.token, payload.role)
      if (!isDeleted) this._invalidPlayerEmitter(socket)
    })
  }

  /**
   * 接続が切れたことを通知する
   *
   * @param {*} socket
   */
  _disconnectListener (socket) {
    socket.on('disconnect', () => {
      this._disconnected = true
      this._resetCountdown()
      this._io.to(this._worldId).emit('notice_disconnect', {})
    })
  }

  /**
   * 現在の攻撃側がどちらのプレイヤーなのか
   */
  _getCurrentPlayer () {
    if (this._turn % 2 === 1) return PLAYER_PEKORA
    return PLAYER_BAIKINKUN
  }
}

module.exports = Dealer
