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
  }

  /**
   * 起点となるイベントの起動
   *
   * @param {*} socket
   * @param {*} payload
   */
  start (socket, payload) {
    this._joinWorld(socket, payload)
    this._attackListener(socket)
    this._leaveWorldListener(socket)
  }

  /**
   * ワールドにJoinする
   *
   * @param {*} socket
   * @param {*} payload
   */
  _joinWorld (socket, payload) {
    worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
      .then((isValid) => {
        if (isValid) {
          this._worldId = payload.worldId
          socket.join(this._worldId)
          this._initGame(socket, payload.role)
        } else this._invalidPlayerEmitter(socket)
      })
      .catch(() => {
        this._invalidPlayerEmitter(socket)
      })
  }

  /**
   * ゲームの初期化処理
   */
  _initGame (socket, requestPlayer) {
    this._io.of('/').in(this._worldId).clients((_, clients) => {
      if (clients.length !== 2) return
      Promise
        .resolve()
        .then(() => {
          return Promise.all([
            word2vec.fetchFirstWord().then((firstWord) => {
              this._baseWords[PLAYER_PEKORA] = firstWord
            }),
            word2vec.fetchFirstWord().then((firstWord) => {
              this._baseWords[PLAYER_BAIKINKUN] = firstWord
            }),
            this._feedbackPositionEmitter(PLAYER_PEKORA_START_POSITION_X, PLAYER_PEKORA_START_POSITION_Y, PLAYER_PEKORA),
            this._feedbackPositionEmitter(PLAYER_BAIKINKUN_START_POSITION_X, PLAYER_BAIKINKUN_START_POSITION_Y, PLAYER_BAIKINKUN)
          ])
        })
        .then(() => {
          return Promise.all([
            this._getWordsAndBaseWordEmitter(PLAYER_PEKORA),
            this._getTurnEmitter()
          ])
        })
        .then(() => {
          return Promise.all([
            this._declareAttackEmitter(socket, requestPlayer),
            this._declareWaitEmitter(socket, requestPlayer)
          ])
        })
        .then(() => {
          return this._getCountdownEmitter(socket, requestPlayer)
        })
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
    return this._io.to(this._worldId).emit('feedback_position', { x, y, player })
  }

  /**
   * ターン数を返す
   */
  _getTurnEmitter () {
    return this._io.to(this._worldId).emit('get_turn', { turn: this._turn })
  }

  /**
   * 単語の選択肢とベースとなる単語を返す
   *
   * @param {*} player
   */
  _getWordsAndBaseWordEmitter (player) {
    return word2vec.fetchWords(this._baseWords[player])
      .then((words) => {
        this._words = words
        this._io.to(this._worldId).emit('get_words_and_baseword', { words, baseWord: this._baseWords[player], player })
      })
  }

  /**
   * 単語の選択肢を返す
   *
   * @param {*} player
   */
  _getWordsEmitter (player) {
    return word2vec.fetchWords(this._baseWords[player])
      .then((words) => {
        this._words = words
        this._io.to(this._worldId).emit('get_words', { words })
      })
  }

  /**
   * ベースとなる単語の更新
   *
   * @param {*} player
   */
  _updateBaseWordEmitter (player) {
    return this._io.to(this._worldId).emit('update_baseword', { baseWord: this._baseWords[player], player })
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
    else return socket.broadcast.to(this._worldId).emit('declare_attack', {})
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
    else return socket.emit('declare_wait', {})
  }

  /**
   * 勝利判定
   *
   * @param {*} player
   */
  _judgeEmitter (player) {
    return this._io.to(this._worldId).emit('judge', { winner: player })
  }

  /**
   * 正当なプレイヤーでない場合
   *
   * @param {*} socket
   */
  _invalidPlayerEmitter (socket) {
    socket.emit('invalid_player', {})
    socket.disconnect()
  }

  /**
   * 攻撃処理
   *
   * @param {*} socket
   */
  _attackListener (socket) {
    socket.on('attack', payload => {
      worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
        .then((isValid) => {
          if (isValid) {
            this._resetCountdown()
            Promise
              .resolve()
              .then(() => {
                const { x, y } = position.depart(this._positions[payload.role].x, this._positions[payload.role].y, payload.baseWord)
                return this._feedbackPositionEmitter(x, y, payload.role)
              })
              .then(() => {
                if (judge.isHit(this._positions[PLAYER_PEKORA], this._positions[PLAYER_BAIKINKUN])) {
                  this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
                  this._judgeEmitter(PLAYER_BAIKINKUN)
                  return
                } else if (judge.isGoal(this._positions[PLAYER_PEKORA].x)) {
                  this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
                  this._judgeEmitter(PLAYER_PEKORA)
                  return
                }
                Promise
                  .resolve()
                  .then(() => {
                    ++this._turn
                    return this._getTurnEmitter()
                  })
                  .then(() => {
                    this._baseWords[payload.role] = payload.baseWord
                    return Promise.all([
                      this._updateBaseWordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN),
                      this._turn <= 2
                        ? this._getWordsAndBaseWordEmitter(PLAYER_BAIKINKUN)
                        : this._getWordsEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
                    ])
                  })
                  .then(() => {
                    return Promise.all([
                      this._declareAttackEmitter(socket, payload.role),
                      this._declareWaitEmitter(socket, payload.role)
                    ])
                  })
                  .then(() => {
                    return this._getCountdownEmitter(socket, payload.role)
                  })
              })
          } else {
            this._invalidPlayerEmitter(socket)
          }
        })
        .catch(() => {
          this._invalidPlayerEmitter(socket)
        })
    })
  }

  /**
   * 切断
   *
   * @param {*} socket
   */
  _leaveWorldListener (socket) {
    socket.on('leave_world', payload => {
      worldStates.delete(payload.worldId, payload.token, payload.role)
        .then((isDeleted) => {
          if (isDeleted) {
            socket.leave(payload.worldId)
            this._resetCountdown()
            socket.disconnect()
          } else {
            this._invalidPlayerEmitter(socket)
          }
        })
        .catch(() => {
          this._invalidPlayerEmitter(socket)
        })
    })
  }

  /**
   * 現在の攻撃側がどちらのプレイヤーなのか
   */
  _getCurrentPlayer () {
    if (this._turn % 2 === 1) return PLAYER_PEKORA
    else return PLAYER_BAIKINKUN
  }

  /**
   * カウントダウン処理により、現在の残り時間を返す
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _getCountdownEmitter (socket, requestPlayer) {
    return (this._timer = setInterval(() => {
      if (this._second < 0) return
      this._io.to(this._worldId).emit('get_countdown', { second: this._second })
      if (this._second === 0) this._declareTimeoutEmitter(socket, requestPlayer)
      this._second -= 1
    }, 1000))
  }

  /**
   * カウントダウンのリセット
   */
  _resetCountdown () {
    clearInterval(this._timer)
    this._second = 30
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
    else return socket.broadcast.to(this._worldId).emit('declare_timeout', { word })
  }
}

module.exports = Dealer
