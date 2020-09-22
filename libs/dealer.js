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
      // TODO: ここでworldIdの正当性をもう１度検証してもいいかも(フロントから存在しないワールドIDを渡そうと思えば渡せるので)
      this._worldId = payload.worldId
      // TODO: トークンの正当性を確認する
      socket.join(this._worldId);
      this._startGame();
    });
  }

  _startGame() {
    // 確認: ここのofっているんやろか
    this._io.of('/').in(this._worldId).clients((err, clients) => {
      if (clients.length === 2) {
        // TODO: SQLiteから取得する
        this._words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        this._baseWord = 'A';
        // TODO: トークンによってどちらをemitするか判断する
        this._declareAttackEmitter(1);
        this._declareWaitEmitter(2);
      }
    });
  }

  _declareAttackEmitter(player) {
    // あとはこの時にターン数とか渡すことになるんかな？
    this._io.to(this._worldId).emit('declare_attack', {words: this._words, baseWord: this._baseWord, player});
  }

  _declareWaitEmitter(player) {
    this._io.to(this._worldId).emit('declare_wait', {words: this._words, baseWord: this._baseWord, player});
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
