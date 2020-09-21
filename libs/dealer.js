class Dealer {
  constructor(io) {
    this.io = io;
    this.io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);
  }

  start() {
    this.io.on('connection', socket => {
      let worldId = '';
      let words = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      let baseWord = 'A';

      // トークンを受け取ってroomにjoinする
      socket.on('join_world', payload => {
        console.log(`join world: ${payload.worldId}`);
        worldId = payload.worldId
        socket.join(payload.worldId);

        this.io.of('/').in(worldId).clients((err, clients) => {
          if (clients.length === 2) {
            // TODO: トークンによってどちらをemitするか判断する
            this.io.to(worldId).emit('declare_attack', {words, baseWord, character: 1});
            this.io.to(worldId).emit('declare_wait', {words, baseWord, character: 2});
          }
        });
      });

      // 単語を受け取って描画
      socket.on('attack', payload => {
        console.log(`attack: ${payload.word}`);

        // TODO: キャラクターの位置の計算処理
        const position = {x: 1, y: 1}
        this.io.to(worldId).emit('draw', {position, character: 1});

        // TODO: ゲームが終了したかどうかの処理
        const judge = false;
        if (judge) {
          this.io.to(worldId).emit('judge', {winner: 1});
        } else {
          socket.broadcast.to(worldId).emit('declare_attack', {words, baseWord, character: 1});
          socket.emit('declare_wait', {words, baseWord, character: 1});
        }
      });
    });
  }
}

module.exports = Dealer;
