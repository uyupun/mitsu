const worldStates = require('../libs/world-states');
const word2vec = require('../libs/word2vec');

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
      // 正しいプレイヤーかどうかの確認
      worldStates.isValidPlayer(payload.worldId, payload.token, payload.role)
        .then((isValid) => {
          if (isValid) {
            this._worldId = payload.worldId;
            socket.join(this._worldId);
            this._startGame();
          } else {
            this._invalidPlayerEmitter(socket);
          }
        })
        .catch((err) => {
          this._invalidPlayerEmitter(socket);
        });
    });
  }

  _startGame() {
    this._io.of('/').in(this._worldId).clients((err, clients) => {
      if (clients.length === 2) {
        Promise
          .resolve()
          .then(() => {
            return Promise.all([
              word2vec.fetchWords().then((words) => {
                this._words = words;
              }),
              word2vec.fetchWord().then((word) => {
                this._baseWord = word;
              }),
              worldStates.getTurn(this._worldId).then((turn) => {
                return turn;
              }),
            ])
          })
          .then((res) => {
            this._declareAttackEmitter(res[2]);
            this._declareWaitEmitter(res[2]);
          })
      }
    });
  }

  _invalidPlayerEmitter(socket) {
    socket.emit('invalid_player', {});
    socket.disconnect();
  }

  _declareAttackEmitter(turn) {
    // あとはこの時にターン数とか渡すことになるんかな？
    this._io.to(this._worldId).emit('declare_attack', {words: this._words, baseWord: this._baseWord, turn});
  }

  _declareWaitEmitter(turn) {
    this._io.to(this._worldId).emit('declare_wait', {words: this._words, baseWord: this._baseWord, turn});
  }

  _attackListener(socket) {
    socket.on('attack', payload => {
      console.log(`attack: ${payload.word}`);

      this._feedBackEmitter();

      // TODO: 勝利判定
      // ポジションの情報とか使いそう
      const judge = false;
      if (judge) {
        this._judgeEmitter();
      } else {
        // words/basewordの更新
        this._words = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
        this._baseWord = 'B';
        this._declareAttackEmitter(2);
        this._declareWaitEmitter(1);
      }
    });
  }

  _feedBackEmitter() {
    // TODO: キャラクターの位置の計算処理
    const position = {x: 1, y: 1}
    this._io.to(this._worldId).emit('feedback', {position, player: 1});
  }

  _judgeEmitter() {
    this._io.to(this._worldId).emit('judge', {winner: 1});
  }
}

module.exports = Dealer;
