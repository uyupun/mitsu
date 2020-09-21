class Dealer {
  constructor(io) {
    this.io = io;
    this.io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);

    this.worldId = '';
    this.words = [];
    this.baseWord = '';
  }

  proceed() {
    this.io.on('connection', socket => {
      this.joinWorldListener(socket);
      this.attackListener(socket);
    });
  }

  joinWorldListener(socket) {
    socket.on('join_world', payload => {
      console.log(`join world: ${payload.worldId}`);
      this.worldId = payload.worldId
      // TODO: トークンの正当性を確認する
      socket.join(this.worldId);
      this.startGame();
    });
  }

  startGame() {
    // 確認: ここのofっているんやろか
    this.io.of('/').in(this.worldId).clients((err, clients) => {
      if (clients.length === 2) {
        // TODO: SQLiteから取得する
        this.words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        this.baseWord = 'A';
        // TODO: トークンによってどちらをemitするか判断する
        this.declareAttackEmitter(1);
        this.declareWaitEmitter(2);
      }
    });
  }

  declareAttackEmitter(player) {
    // あとはこの時にターン数とか渡すことになるんかな？
    this.io.to(this.worldId).emit('declare_attack', {words: this.words, baseWord: this.baseWord, player});
  }

  declareWaitEmitter(player) {
    this.io.to(this.worldId).emit('declare_wait', {words: this.words, baseWord: this.baseWord, player});
  }

  attackListener(socket) {
    socket.on('attack', payload => {
      console.log(`attack: ${payload.word}`);

      this.feedBackEmitter();

      // TODO: 勝利判定
      // ポジションの情報とか使いそう
      const judge = false;
      if (judge) {
        this.judgeEmitter(this.worldId);
      } else {
        // words/basewordの更新
        this.words = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
        this.baseWord = 'B';
        this.declareAttackEmitter(2);
        this.declareWaitEmitter(1);
      }
    });
  }

  feedBackEmitter() {
    // TODO: キャラクターの位置の計算処理
    const position = {x: 1, y: 1}
    this.io.to(this.worldId).emit('feedback', {position, player: 1});
  }

  judgeEmitter(worldId) {
    this.io.to(worldId).emit('judge', {winner: 1});
  }
}

module.exports = Dealer;
