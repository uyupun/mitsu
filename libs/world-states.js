const Redis = require('ioredis');

const WorldStates = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);

module.exports = WorldStates
