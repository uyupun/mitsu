const Redis = require('ioredis');
const {
  PLAYER_PEKORA,
  PLAYER_BAIKINKUN,
  WORLD_TTL,
} = require('./constants');

/**
 * ワールドに必要な情報の保持
 */
class WorldStates {
  constructor() {
    this._redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
  }

  /**
   * ワールドIDとトークンの保存
   *
   * @param {*} worldId
   * @param {*} tokens
   */
  create(worldId, tokens) {
    this._redis.set(worldId, JSON.stringify({
      worldId,
      tokens,
    }), 'EX', WORLD_TTL);
  }

  /**
   * ワールドIDとトークンの取得
   *
   * @param {*} worldId
   */
  get(worldId) {
    return this._redis.get(worldId)
      .then((obj) => {
        return JSON.parse(obj);
      })
      .catch((err) => {
        return err;
      });
  }

  /**
   * 正当なプレイヤーかどうかの検証
   *
   * @param {*} worldId
   * @param {*} token
   * @param {*} role
   */
  isValidPlayer(worldId, token, role) {
    return this._redis.get(worldId)
      .then((obj) => {
        obj = JSON.parse(obj);
        if ((role === PLAYER_PEKORA && obj.tokens[PLAYER_PEKORA] === token) ||
             role === PLAYER_BAIKINKUN && obj.tokens[PLAYER_BAIKINKUN] === token) return true;
        return false;
      })
      .catch((err) => {
        return false;
      });
  }

  /**
   * ワールドの情報の削除
   *
   * @param {*} worldId
   * @param {*} token
   * @param {*} role
   */
  delete(worldId, token, role) {
    return this.isValidPlayer(worldId, token, role)
      .then((isValid) => {
        if (isValid) {
          return this._redis.del(worldId)
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
