const Redis = require('ioredis');
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN,
} = require('./constants');

class WorldStates {
  constructor() {
    this.redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
  }

  create(worldId, tokens) {
    this.redis.set(worldId, JSON.stringify({
      worldId,
      tokens,
      turn: 1,
    }), 'EX', process.env.WORLD_TTL);
  }

  get(worldId) {
    return this.redis.get(worldId)
      .then((obj) => {
        return JSON.parse(obj);
      })
      .catch((err) => {
        return err;
      });
  }

  getTurn(worldId) {
    return this.get(worldId).then((obj) => {
      return obj.turn;
    })
  }

  incrementTurn(worldId) {
    return this.get(worldId).then((obj) => {
      return this.redis.set(worldId, JSON.stringify({
        worldId: obj.worldId,
        tokens: obj.tokens,
        turn: obj.turn + 1,
      }));
    })
  }

  getCurrentPlayer(worldId) {
    return this.getTurn(worldId).then((turn) => {
      if (turn % 2 === 1) return PLAYER_PEKORA;
      else return PLAYER_BAIKINKUN;
    })
  }

  isValidPlayer(worldId, token, role) {
    return this.redis.get(worldId)
      .then((obj) => {
        obj = JSON.parse(obj);
        if ((role === PLAYER_PEKORA && obj.tokens['1'] === token) ||
             role === PLAYER_BAIKINKUN && obj.tokens['2'] === token) return true;
        return false;
      })
      .catch((err) => {
        return false;
      });
  }

  deleteWorld(worldId, token, role) {
    return this.isValidPlayer(worldId, token, role)
      .then((isValid) => {
        if (isValid) {
          return this.redis.del(worldId)
            .then(() => {
              return true;
            })
            .catch((err) => {
              return false;
            })
        }
        return false;
      })
      .catch((err) => {
        return false;
      })
  }
}

module.exports = new WorldStates();
