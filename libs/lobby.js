const Dealer = require('./dealer');

class Lobby {
  constructor(io) {
    this._io = io;
    this._io.origins(process.env.SOCIAL_RESISTANCE_ADDRESS);
    this._dealers = {};
  }

  enter() {
    this._io.on('connection', (socket) => {
      this._joinWorldListener(socket);
    });
  }

  _joinWorldListener(socket) {
    Promise
      .resolve()
      .then(() => {
        return socket.on('join_world', (payload) => {
          if (!this._dealers[payload.worldId]) {
            this._dealers[payload.worldId] = new Dealer(this._io)
          }
          this._dealers[payload.worldId].joinWorld(socket, payload);
          this._dealers[payload.worldId].attackListener(socket);
          this._dealers[payload.worldId].disconnectWorldListener(socket);
        });
      })
  }
}

module.exports = Lobby;
