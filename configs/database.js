require('dotenv').config();

module.exports = {
  "development": {
    "dialect": process.env.DB_CONNECTION,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "database": process.env.DB_DATABASE,
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
  },
  "test": {
    "dialect": process.env.DB_CONNECTION,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "database": process.env.DB_DATABASE,
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
  },
  "production": {
    "dialect": process.env.DB_CONNECTION,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "database": process.env.DB_DATABASE,
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
  }
};
