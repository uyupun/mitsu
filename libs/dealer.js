const worldStates = require('./world-states');
const word2vec = require('./word2vec');
const judge = require('./judge');
const position = require('./position');
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN,
  PLAYER_PEKORA_START_POSITION_X,
  PLAYER_PEKORA_START_POSITION_Y,
  PLAYER_BAIKINKUN_START_POSITION_X,
  PLAYER_BAIKINKUN_START_POSITION_Y,
} = require('./constants');

/**
 * ゲームの進行を担当する
 */
class Dealer {
  constructor(io) {
    this._io = io;

    this._worldId = '';
    this._words = [];
    this._baseWords = {
      [PLAYER_PEKORA]: null,
      [PLAYER_BAIKINKUN]: null,
    }
    this._positions = {
      [PLAYER_PEKORA]: {x: 0, y: 0},
      [PLAYER_BAIKINKUN]: {x: 0, y: 0}
    };
    this._turn = 1;
  }

  /**
   * ワールドにJoinする
   *
   * @param {*} socket
   * @param {*} payload
   */
  joinWorld(socket, payload) {
    worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
      .then((isValid) => {
        if (isValid) {
          this._worldId = payload.worldId;
          socket.join(this._worldId);
          this._startGame(socket, payload.role);
        } else {
          this._invalidPlayerEmitter(socket);
        }
      })
      .catch((err) => {
        this._invalidPlayerEmitter(socket);
      });
  }

  /**
   * ゲームの開始処理
   */
  _startGame(socket, requestPlayer) {
    this._io.of('/').in(this._worldId).clients((err, clients) => {
      if (clients.length === 2) {
        Promise
          .resolve()
          .then(() => {
            return Promise.all([
              word2vec.fetchFirstWord().then((firstWord) => this._baseWords[PLAYER_PEKORA] = firstWord),
              word2vec.fetchFirstWord().then((firstWord) => this._baseWords[PLAYER_BAIKINKUN] = firstWord),
              this._feedbackPositionEmitter(PLAYER_PEKORA_START_POSITION_X, PLAYER_PEKORA_START_POSITION_Y, PLAYER_PEKORA),
              this._feedbackPositionEmitter(PLAYER_BAIKINKUN_START_POSITION_X, PLAYER_BAIKINKUN_START_POSITION_Y, PLAYER_BAIKINKUN),
            ]);
          })
          .then(() => {
            return Promise.all([
              this._getTurnEmitter(),
              this._getWordsAndBasewordEmitter(PLAYER_PEKORA),
            ]);
          })
          .then(() => {
            return Promise.all([
              this._declareAttackEmitter(socket, requestPlayer),
              this._declareWaitEmitter(socket, requestPlayer),
            ]);
          })
      }
    });
  }

  /**
   * 正当なプレイヤーでない場合
   *
   * @param {*} socket
   */
  _invalidPlayerEmitter(socket) {
    socket.emit('invalid_player', {});
    socket.disconnect();
  }

  /**
   * フィールド上の移動の情報を返す
   *
   * @param {*} x
   * @param {*} y
   * @param {*} player
   */
  _feedbackPositionEmitter(x, y, player) {
    this._positions[player].x = x;
    this._positions[player].y = y;
    return this._io.to(this._worldId).emit('feedback_position', {x, y, player});
  }

  /**
   * 単語の選択肢とベースとなる単語を返す
   *
   * @param {*} player
   */
  _getWordsAndBasewordEmitter(player) {
    return word2vec.fetchWords(this._baseWords[player])
      .then((words) => {
        this._words = words;
        this._io.to(this._worldId).emit('get_words_and_baseword', { words, baseWord: this._baseWords[player], player });
      })
  }

  /**
   * ベースとなる単語の更新
   *
   * @param {*} player
   */
  _updateBasewordEmitter(player) {
    this._io.to(this._worldId).emit('update_baseword', { baseWord: this._baseWords[player], player });
  }

  /**
   * 単語の選択肢を返す
   *
   * @param {*} player
   */
  _getWordsEmitter(player) {
    return word2vec.fetchWords(this._baseWords[player])
      .then((words) => {
        this._words = words;
        this._io.to(this._worldId).emit('get_words', { words });
      })
  }

  /**
   * ターン数を返す
   */
  _getTurnEmitter() {
    return this._io.to(this._worldId).emit('get_turn', { turn: this._turn });
  }

  /**
   * 攻撃のターンであることを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _declareAttackEmitter(socket, requestPlayer) {
    const currentPlayer = this._getCurrentPlayer();
    if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.emit('declare_attack', {});
    else return socket.broadcast.to(this._worldId).emit('declare_attack', {});
  }

  /**
   * 待機するターンであることを通知する
   *
   * @param {*} socket
   * @param {*} requestPlayer
   */
  _declareWaitEmitter(socket, requestPlayer) {
    const currentPlayer = this._getCurrentPlayer();
    if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) return socket.broadcast.to(this._worldId).emit('declare_wait', {});
    else return socket.emit('declare_wait', {});
  }

  /**
   * 現在の攻撃側がどちらのプレイヤーなのか
   */
  _getCurrentPlayer() {
    if (this._turn % 2 === 1) return PLAYER_PEKORA;
    else PLAYER_BAIKINKUN;
  }

  /**
   * 攻撃処理
   *
   * @param {*} socket
   */
  attackListener(socket) {
    socket.on('attack', payload => {
      worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
        .then((isValid) => {
          if (isValid) {
            Promise
              .resolve()
              .then(() => {
                const {x, y} = position.depart(this._positions[payload.role].x, this._positions[payload.role].y, payload.baseWord)
                return this._feedbackPositionEmitter(x, y, payload.role);
              })
              .then(() => {
                if (judge.isHit(this._positions[PLAYER_PEKORA], this._positions[PLAYER_BAIKINKUN])) {
                  this._updateBasewordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
                  this._judgeEmitter(PLAYER_BAIKINKUN);
                } else if (judge.isGoal(this._positions[PLAYER_PEKORA].x)) {
                  this._updateBasewordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN)
                  this._judgeEmitter(PLAYER_PEKORA);
                } else {
                  Promise
                    .resolve()
                    .then(() => {
                      return ++this._turn;
                    })
                    .then(() => {
                      return this._getTurnEmitter();
                    })
                    .then(() => {
                      this._baseWords[payload.role] = payload.baseWord;
                      return Promise.all([
                        this._updateBasewordEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN),
                        this._turn <= 2
                          ? this._getWordsAndBasewordEmitter(PLAYER_BAIKINKUN)
                          : this._getWordsEmitter(payload.role === PLAYER_PEKORA ? PLAYER_PEKORA : PLAYER_BAIKINKUN),
                      ]);
                    })
                    .then(() => {
                      Promise.all([
                        this._declareAttackEmitter(socket, payload.role),
                        this._declareWaitEmitter(socket, payload.role),
                      ]);
                    })
                }
              })
          } else {
            this._invalidPlayerEmitter(socket);
          }
        })
        .catch((err) => {
          this._invalidPlayerEmitter(socket);
        });
    });
  }

  /**
   * 勝利判定
   *
   * @param {*} player
   */
  _judgeEmitter(player) {
    this._io.to(this._worldId).emit('judge', {winner: player});
  }

  /**
   * 切断
   *
   * @param {*} socket
   */
  disconnectWorldListener(socket) {
    socket.on('disconnect_world', payload => {
      worldStates.delete(payload.worldId, payload.token, payload.role)
        .then((isDeleted) => {
          if (isDeleted) {
            socket.leave(payload.worldId)
            socket.disconnect();
          } else {
            this._invalidPlayerEmitter(socket)
          }
        })
        .catch((err) => {
          this._invalidPlayerEmitter(socket)
        });
    });
  }
}

module.exports = Dealer;
