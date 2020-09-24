const worldStates = require('../libs/world-states');
const word2vec = require('../libs/word2vec');
const {
  PLAYER_PEKORA_START_POSITION_X,
  PLAYER_PEKORA_START_POSITION_Y,
  PLAYER_BAIKINKUN_START_POSITION_X,
  PLAYER_BAIKINKUN_START_POSITION_Y,
} = require('../libs/constants');

class Dealer {
  constructor(io) {
    this._io = io;
    this._io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);

    this._worldId = '';
    this._words = [];
    this._baseWord = '';
  }

  proceed() {
    this._io.on('connection', socket => {
      this._joinWorldListener(socket);
      this._attackListener(socket);
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

  _startGame(socket, role) {
    this._io.of('/').in(this._worldId).clients((err, clients) => {
      if (clients.length === 2) {
        Promise
          .resolve()
          .then(() => {
            return word2vec.fetchFirstWord().then((firstWord) => {
              this._baseWord = firstWord;
            })
          })
          .then(() => {
            return Promise.all([
              word2vec.fetchWords(this._baseWord).then((words) => {
                this._words = words;
              }),
              worldStates.getTurn(this._worldId).then((turn) => {
                return turn;
              }),
            ]);
          })
          .then((res) => {
            this._feedbackEmitter(PLAYER_PEKORA_START_POSITION_X, PLAYER_PEKORA_START_POSITION_Y, 1);
            this._feedbackEmitter(PLAYER_BAIKINKUN_START_POSITION_X, PLAYER_BAIKINKUN_START_POSITION_Y, 2);
            this._declareAttackEmitter(socket, res[1], role);
            this._declareWaitEmitter(socket, res[1], role);
          })
      }
    });
  }

  _invalidPlayerEmitter(socket) {
    socket.emit('invalid_player', {});
    socket.disconnect();
  }

  _declareAttackEmitter(socket, turn, role) {
    if (turn % 2 === 1 && role === '1')
      socket.emit('declare_attack', {words: this._words, baseWord: this._baseWord, turn});
    else
      socket.broadcast.to(this._worldId).emit('declare_attack', {words: this._words, baseWord: this._baseWord, turn});
  }

  _declareWaitEmitter(socket, turn, role) {
    if (turn % 2 === 1 && role === '1')
      socket.broadcast.to(this._worldId).emit('declare_wait', {words: this._words, baseWord: this._baseWord, turn});
    else
      socket.emit('declare_wait', {words: this._words, baseWord: this._baseWord, turn});
  }

  _feedbackEmitter(x, y, player) {
    this._io.to(this._worldId).emit('feedback', {x, y, player, baseWord: this._baseWord});
  }

  _attackListener(socket) {
    socket.on('attack', payload => {
      console.log(`attack: ${payload.word}`);

      this._feedbackEmitter();

      // TODO: 勝利判定
      // ポジションの情報とか使いそう
      const judge = false;
      if (judge) {
        this._judgeEmitter();
      } else {
        // words/basewordの更新
        this._words = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
        this._baseWord = 'B';
        // TODO: turnとrole渡す
        this._declareAttackEmitter(socket, 2, 2);
        this._declareWaitEmitter(socket, 2, 1);
      }
    });
  }

  _judgeEmitter() {
    this._io.to(this._worldId).emit('judge', {winner: 1});
  }
}

module.exports = Dealer;
