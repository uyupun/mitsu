const Redis = require('ioredis');

class WorldStates {
  constructor() {
    this.redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
  }

  set(worldId, tokens) {
    this.redis.set(worldId, JSON.stringify({
      worldId: worldId,
      tokens: tokens,
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

  isValidPlayer(worldId, token, role) {
    return this.redis.get(worldId)
      .then((obj) => {
        obj = JSON.parse(obj);
        console.log(role)
        if ((role === '1' && obj.tokens['1'] === token) ||
             role === '2' && obj.tokens['2'] === token) return true;
        return false;
      })
      .catch((err) => {
        return false;
      });
  }
}

module.exports = new WorldStates();
