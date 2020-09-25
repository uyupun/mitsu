const worldStates = require('./world-states');
const word2vec = require('./word2vec');
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
    this._baseWord = '';
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
        word2vec.fetchFirstWord().then((firstWord) => {
          this._baseWord = firstWord;
          this._feedbackPositionsEmitter(PLAYER_PEKORA_START_POSITION_X, PLAYER_PEKORA_START_POSITION_Y, PLAYER_PEKORA);
          this._feedbackPositionsEmitter(PLAYER_BAIKINKUN_START_POSITION_X, PLAYER_BAIKINKUN_START_POSITION_Y, PLAYER_BAIKINKUN);
          this._gameResourcesEmitter(PLAYER_PEKORA);
          this._declareAttackEmitter(socket, requestPlayer);
          this._declareWaitEmitter(socket, requestPlayer);
        });
      }
    });
  }

  _invalidPlayerEmitter(socket) {
    socket.emit('invalid_player', {});
    socket.disconnect();
  }

  _declareAttackEmitter(socket, requestPlayer) {
    worldStates.getCurrentPlayer(this._worldId).then((currentPlayer) => {
      if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) socket.emit('declare_attack', {});
      else socket.broadcast.to(this._worldId).emit('declare_attack', {});
    });
  }

  _declareWaitEmitter(socket, requestPlayer) {
    worldStates.getCurrentPlayer(this._worldId).then((currentPlayer) => {
      if (currentPlayer === PLAYER_PEKORA && requestPlayer === PLAYER_PEKORA) socket.broadcast.to(this._worldId).emit('declare_wait', {});
      else socket.emit('declare_wait', {});
    });
  }

  _feedbackPositionsEmitter(x, y, player) {
    this._io.to(this._worldId).emit('feedback_positions', {x, y, player});
  }

  _gameResourcesEmitter(player) {
    Promise
      .resolve()
      .then(() => {
        return Promise.all([
          word2vec.fetchWords(this._baseWord).then((words) => this._words = words),
          worldStates.getTurn(this._worldId).then((turn) => this._turn = turn),
        ]);
      })
      .then(() => {
        this._io.to(this._worldId).emit('game_resources', {words: this._words, baseWord: this._baseWord, player, turn: this._turn});
      });
  }

  _attackListener(socket) {
    socket.on('attack', payload => {
      console.log(`attack: ${payload.baseWord}`);

      worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
        .then((isValid) => {
          if (isValid) {
            // TODO: ポジションの計算
            this._feedbackPositionsEmitter(payload.baseWord.move_x, payload.baseWord.move_y, payload.role);
            // TODO: 勝利判定
            const judge = false;
            if (judge) {
              this._judgeEmitter();
            } else {
              worldStates.incrementTurn(this._worldId);
              this._baseWord = payload.baseWord;
              this._gameResourcesEmitter(payload.role === PLAYER_PEKORA ? PLAYER_BAIKINKUN : PLAYER_PEKORA);
              this._declareAttackEmitter(socket, payload.role);
              this._declareWaitEmitter(socket, payload.role);
            }
          } else {
            this._invalidPlayerEmitter(socket);
          }
        })
        .catch((err) => {
          this._invalidPlayerEmitter(socket);
        });
    });
  }

  _judgeEmitter() {
    this._io.to(this._worldId).emit('judge', {winner: 1});
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
