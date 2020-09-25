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

class Dealer {
  constructor(io) {
    this._io = io;
    this._io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);

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
    this._turn = 0;
  }

  proceed() {
    this._io.on('connection', socket => {
      this._joinWorldListener(socket);
      this._attackListener(socket);
      this._disconnectWorldListener(socket);
    });
  }

  _joinWorldListener(socket) {
    socket.on('join_world', payload => {
      console.log(`join world: ${payload.worldId}`);
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
    });
  }

  _startGame(socket, requestPlayer) {
    this._io.of('/').in(this._worldId).clients((err, clients) => {
      if (clients.length === 2) {
        Promise
          .resolve()
          .then(() => {
            return Promise.all([
              word2vec.fetchFirstWord().then((firstWord) => this._baseWords[PLAYER_PEKORA] = firstWord),
              word2vec.fetchFirstWord().then((firstWord) => this._baseWords[PLAYER_BAIKINKUN] = firstWord),
              this._feedbackPositionsEmitter(PLAYER_PEKORA_START_POSITION_X, PLAYER_PEKORA_START_POSITION_Y, PLAYER_PEKORA),
              this._feedbackPositionsEmitter(PLAYER_BAIKINKUN_START_POSITION_X, PLAYER_BAIKINKUN_START_POSITION_Y, PLAYER_BAIKINKUN),
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

  _invalidPlayerEmitter(socket) {
    socket.emit('invalid_player', {});
    socket.disconnect();
  }

  _feedbackPositionsEmitter(x, y, player) {
    this._positions[player].x = x;
    this._positions[player].y = y;
    return this._io.to(this._worldId).emit('feedback_positions', {x, y, player});
  }

  _getWordsAndBasewordEmitter(player) {
    return word2vec.fetchWords(this._baseWords[player])
      .then((words) => {
        this._words = words;
        this._io.to(this._worldId).emit('get_words_and_baseword', { words, baseWord: this._baseWords[player], player });
      })
  }

  _updateBasewordEmitter(player) {
    this._io.to(this._worldId).emit('update_baseword', { baseWord: this._baseWords[player], player });
  }

  _getWordsEmitter(player) {
    return word2vec.fetchWords(this._baseWords[player])
      .then((words) => {
        this._words = words;
        this._io.to(this._worldId).emit('get_words', { words });
      })
  }

  _getTurnEmitter() {
    return worldStates.getTurn(this._worldId)
      .then((turn) => {
        this._turn = turn;
        this._io.to(this._worldId).emit('get_turn', { turn });
      })
  }

  _declareAttackEmitter(socket, requestPlayer) {
    return worldStates.getCurrentPlayer(this._worldId).then((currentPlayer) => {
      if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) socket.emit('declare_attack', {});
      else socket.broadcast.to(this._worldId).emit('declare_attack', {});
    });
  }

  _declareWaitEmitter(socket, requestPlayer) {
    return worldStates.getCurrentPlayer(this._worldId).then((currentPlayer) => {
      if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) socket.broadcast.to(this._worldId).emit('declare_wait', {});
      else socket.emit('declare_wait', {});
    });
  }

  _attackListener(socket) {
    socket.on('attack', payload => {
      console.log(`attack: ${payload}`);
      worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
        .then((isValid) => {
          if (isValid) {
            Promise
              .resolve()
              .then(() => {
                const {x, y} = position.depart(this._positions[payload.role].x, this._positions[payload.role].y, payload.baseWord)
                return this._feedbackPositionsEmitter(x, y, payload.role);
              })
              .then(() => {
                if (judge.isHit(this._positions[PLAYER_PEKORA], this._positions[PLAYER_BAIKINKUN])) {
                  this._judgeEmitter(PLAYER_BAIKINKUN);
                } else if (judge.isGoal(this._positions[PLAYER_PEKORA].x)) {
                  this._judgeEmitter(PLAYER_PEKORA);
                } else {
                  Promise
                    .resolve()
                    .then(() => {
                      return worldStates.incrementTurn(this._worldId);
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

  _judgeEmitter(player) {
    this._io.to(this._worldId).emit('judge', {winner: player});
  }

  _disconnectWorldListener(socket) {
    socket.on('disconnect_world', payload => {
      worldStates.deleteWorld(payload.worldId, payload.token, payload.role)
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
