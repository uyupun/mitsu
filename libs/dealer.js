const world = require('./world')
const word2vec = require('./word2vec')
const judge = require('./judge')
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN
} = require('./constants')

/**
 * ゲームの進行を担当する
 */
class Dealer {
  constructor (io, state) {
    this._io = io
    this._state = state
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
    this._noticeDisconnectListener(socket)
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
    socket.join(this._state.id)
    this._setup(socket, payload.role)
  }

  /**
   * ゲームの開始処理
   */
  async _setup (socket, role) {
    await this._io.of('/').in(this._state.id).clients(async (_, clients) => {
      if (clients.length !== 2) return
      this._state.baseWords[PLAYER_PEKORA] = await word2vec.fetchFirstWord()
      this._state.baseWords[PLAYER_BAIKINKUN] = await word2vec.fetchFirstWord()
      this._feedbackPositionEmitter(PLAYER_PEKORA)
      this._feedbackPositionEmitter(PLAYER_BAIKINKUN)
      this._getWordsAndBaseWordEmitter(PLAYER_PEKORA)
      this._getTurnEmitter()
      this._getCountdownEmitter(socket, role)
      this._declareAttackEmitter(socket, role)
      this._declareWaitEmitter(socket, role)
    })
  }

  /**
   * フィールド上の移動の情報を返す
   *
   * @param {*} role
   */
  _feedbackPositionEmitter (role) {
    const { x, y } = this._state.field.getPositions(role)
    this._io.to(this._state.id).emit('feedback_position', { x, y, role })
  }

  /**
   * 単語の選択肢とベースとなる単語を返す
   *
   * @param {*} role
   */
  async _getWordsAndBaseWordEmitter (role) {
    this._state.words = await word2vec.fetchWords(this._state.baseWords[role])
    this._io.to(this._state.id).emit('get_words_and_baseword', { words: this._state.words, baseWord: this._state.baseWords[role], role })
  }

  /**
   * 単語の選択肢を返す
   *
   * @param {*} role
   */
  async _getWordsEmitter (role) {
    this._state.words = await word2vec.fetchWords(this._state.baseWords[role])
    this._io.to(this._state.id).emit('get_words', { words: this._state.words })
  }

  /**
   * ベースとなる単語の更新
   *
   * @param {*} role
   */
  _updateBaseWordEmitter (role) {
    this._io.to(this._state.id).emit('update_baseword', { baseWord: this._state.baseWords[role], role })
  }

  /**
   * ターン数を返す
   */
  _getTurnEmitter () {
    this._io.to(this._state.id).emit('get_turn', { turn: this._state.turn.count })
  }

  /**
   * カウントダウン処理により、現在の残り時間を返す
   *
   * @param {*} socket
   * @param {*} role
   */
  _getCountdownEmitter (socket, role) {
    this._state.turn.countdown((second) => {
      this._io.to(this._state.id).emit('get_countdown', { second })
      if (second === 0) this._noticeTurnTimeoutEmitter(socket, role)
    })
  }

  /**
   * 攻撃のターンであることを通知する
   *
   * @param {*} socket
   * @param {*} role
   */
  _declareAttackEmitter (socket, role) {
    if (this._state.turn.currentPlayer === PLAYER_PEKORA && role === PLAYER_PEKORA) return socket.emit('declare_attack', {})
    socket.broadcast.to(this._state.id).emit('declare_attack', {})
  }

  /**
   * 待機するターンであることを通知する
   *
   * @param {*} socket
   * @param {*} role
   */
  _declareWaitEmitter (socket, role) {
    if (this._state.turn.currentPlayer === PLAYER_PEKORA && role === PLAYER_PEKORA) return socket.broadcast.to(this._state.id).emit('declare_wait', {})
    socket.emit('declare_wait', {})
  }

  /**
   * ターンが時間切れしたことを通知する
   *
   * @param {*} socket
   * @param {*} role
   */
  _noticeTurnTimeoutEmitter (socket, role) {
    const randomIndex = Math.floor(Math.random() * this._state.words.length)
    const word = this._state.words[randomIndex]
    if (this._state.turn.currentPlayer === PLAYER_PEKORA && role === PLAYER_PEKORA) return socket.emit('notice_turn_timeout', { word })
    socket.broadcast.to(this._state.id).emit('notice_turn_timeout', { word })
  }

  /**
   * 勝利判定
   *
   * @param {*} role
   */
  _judgeEmitter (role) {
    this._io.to(this._state.id).emit('judge', { winner: role })
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
      this._state.field.move(payload.role, payload.baseWord.move_x, payload.baseWord.move_y)
      this._feedbackPositionEmitter(payload.role)
      const pekoraPositions = this._state.field.getPositions(PLAYER_PEKORA)
      const baikinkunPositions = this._state.field.getPositions(PLAYER_BAIKINKUN)
      if (judge.isHit(pekoraPositions, baikinkunPositions)) {
        this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
        return this._judgeEmitter(PLAYER_BAIKINKUN)
      } else if (judge.isGoal(pekoraPositions.x)) {
        this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
        return this._judgeEmitter(PLAYER_PEKORA)
      }
      this._state.turn.increment()
      this._getTurnEmitter()
      this._getCountdownEmitter(socket, payload.role)
      this._state.baseWords[payload.role] = payload.baseWord
      this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
      if (this._state.turn.count <= 2) this._getWordsAndBaseWordEmitter(PLAYER_BAIKINKUN)
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
  _noticeDisconnectListener (socket) {
    socket.on('disconnect', () => {
      this._io.of('/').in(this._state.id).clients((_, clients) => {
        if (clients.length === 2) return
        this._disconnected = true
        this._io.to(this._state.id).emit('notice_disconnect', {})
      })
    })
  }
}

module.exports = Dealer
