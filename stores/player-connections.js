const Redis = require('ioredis');

const PlayerConnections = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);

module.exports = PlayerConnections
