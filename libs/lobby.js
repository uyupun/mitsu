const Dealer = require('./dealer');

/**
 * ゲームの開始・終了処理、
 * Dealerインスタンス(WebSocketコネクション)の管理
 */
class Lobby {
  constructor(io) {
    this._io = io;
    this._io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);
    this._dealers = {};
  }

  /**
   * WebSocketでの通信を検知する
   */
  enter() {
    this._io.on('connection', (socket) => {
      this._joinWorldListener(socket);
    });
  }

  /**
   * ワールドへのJoinの処理
   * ワールドID毎にDealerクラスのインスタンスを作成することで、第三者のプレイヤーがルーム内の変数を書き換えてしまうことを防ぐ
   *
   * @param {*} socket
   */
  _joinWorldListener(socket) {
    socket.on('join_world', (payload) => {
      if (!this._dealers[payload.worldId])
        this._dealers[payload.worldId] = new Dealer(this._io)
      this._dealers[payload.worldId].start(socket, payload);
    });
  }
}

module.exports = Lobby;
