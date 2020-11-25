const world = require('./world')
const word2vec = require('./word2vec')
const judge = require('./judge')
const position = require('./position')
const Turn = require('./turn')
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
    this._turn = new Turn()
    this._words = []
    this._baseWords = {
      [PLAYER_PEKORA]: null,
      [PLAYER_BAIKINKUN]: null
    }
    this._positions = {
      [PLAYER_PEKORA]: { x: 0, y: 0 },
      [PLAYER_BAIKINKUN]: { x: 0, y: 0 }
    }
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
    this._disconnectListener(socket)
  }

  /**
   * ワールドにJoinする
   *
   * @param {*} socket
   * @param {*} payload
   */
  _join (socket, payload) {
    if (this._disconnected) return socket.emit('notice_disconnect', {})
    const isValid = world.isValidPlayer(payload.worldId, payload.token, payload.role)
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
    this._io.to(this._worldId).emit('get_turn', { turn: this._turn.count })
  }

  /**
   * カウントダウン処理により、現在の残り時間を返す
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _getCountdownEmitter (socket, requestPlayer) {
    this._turn.countdown((second) => {
      this._io.to(this._worldId).emit('get_countdown', { second })
      if (second === 0) this._noticeTurnTimeoutEmitter(socket, requestPlayer)
    })
  }

  /**
   * 攻撃のターンであることを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _declareAttackEmitter (socket, requestPlayer) {
    if (this._turn.currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.emit('declare_attack', {})
    socket.broadcast.to(this._worldId).emit('declare_attack', {})
  }

  /**
   * 待機するターンであることを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _declareWaitEmitter (socket, requestPlayer) {
    if (this._turn.currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.broadcast.to(this._worldId).emit('declare_wait', {})
    socket.emit('declare_wait', {})
  }

  /**
   * ターンが時間切れしたことを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _noticeTurnTimeoutEmitter (socket, requestPlayer) {
    const randomIndex = Math.floor(Math.random() * this._words.length)
    const word = this._words[randomIndex]
    if (this._turn.currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.emit('notice_turn_timeout', { word })
    socket.broadcast.to(this._worldId).emit('notice_turn_timeout', { word })
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
   * 攻撃処理
   *
   * @param {*} socket
   */
  _attackListener (socket) {
    socket.on('attack', (payload) => {
      const isValid = world.isValidPlayer(payload.worldId, payload.token, payload.role)
      if (!isValid) return this._invalidPlayerEmitter(socket)
      const { x, y } = position.depart(this._positions[payload.role].x, this._positions[payload.role].y, payload.baseWord)
      this._feedbackPositionEmitter(x, y, payload.role)
      if (judge.isHit(this._positions[PLAYER_PEKORA], this._positions[PLAYER_BAIKINKUN])) {
        this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
        return this._judgeEmitter(PLAYER_BAIKINKUN)
      } else if (judge.isGoal(this._positions[PLAYER_PEKORA].x)) {
        this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
        return this._judgeEmitter(PLAYER_PEKORA)
      }
      this._turn.increment()
      this._getTurnEmitter()
      this._getCountdownEmitter(socket, payload.role)
      this._baseWords[payload.role] = payload.baseWord
      this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
      if (this._turn.count <= 2) this._getWordsAndBaseWordEmitter(PLAYER_BAIKINKUN)
      else this._getWordsEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
      this._declareAttackEmitter(socket, payload.role)
      this._declareWaitEmitter(socket, payload.role)
    })
  }

  /**
   * 接続が切れたことを通知する
   *
   * @param {*} socket
   */
  _disconnectListener (socket) {
    socket.on('disconnect', () => {
      this._io.of('/').in(this._worldId).clients((_, clients) => {
        if (clients.length === 2) return
        this._disconnected = true
        this._io.to(this._worldId).emit('notice_disconnect', {})
      })
    })
  }
}

module.exports = Dealer
