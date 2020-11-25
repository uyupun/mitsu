const World = require('./world')
const Dealer = require('./dealer')
const { WORLD_TTL } = require('./constants')
require('dotenv').config()

/**
 * ゲームの開始・終了処理、
 * Dealerインスタンス(WebSocketコネクション)の管理
 */
class Lobby {
  constructor (io) {
    this._io = io
    this._io.origins(process.env.FRONTEND_URL)
  }

  /**
   * WebSocketでの通信を検知する
   */
  enter () {
    this._io.on('connection', (socket) => {
      this._joinWorldListener(socket)
    })
  }

  /**
   * ワールドへのJoinの処理
   * ワールドID毎にDealerクラスのインスタンスを作成することで、第三者のプレイヤーがルーム内の変数を書き換えてしまうことを防ぐ
   *
   * @param {*} socket
   */
  _joinWorldListener (socket) {
    socket.on('join_world', (payload) => {
      const state = World.find(payload.worldId)
      if (!state) return this._invalidPlayerEmitter(socket)
      if (!state.dealer) {
        state.dealer = new Dealer(this._io)
        setTimeout(World.remove, WORLD_TTL * 1000, payload.worldId)
      }
      state.dealer.entry(socket, payload)
    })
  }

  /**
   * 正当なプレイヤーでない場合
   *
   * @param {*} socket
   */
  _invalidPlayerEmitter (socket) {
    socket.emit('invalid_player', {})
  }
}

module.exports = Lobby
