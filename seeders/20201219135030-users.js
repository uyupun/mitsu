'use strict'

const auth = require('../libs/auth')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = auth.hashPassword('password')
    await queryInterface.bulkInsert('users', [
      {
        user_id: 'foo',
        password: hashedPassword,
        avatar_id: 1,
        rate: Math.floor(Math.random() * 2000),
        win: 10,
        lose: 0
      },
      {
        user_id: 'bar',
        password: hashedPassword,
        avatar_id: 1,
        rate: Math.floor(Math.random() * 2000),
        win: 9,
        lose: 1
      },
      {
        user_id: 'baz',
        password: hashedPassword,
        avatar_id: 1,
        rate: Math.floor(Math.random() * 2000),
        win: 8,
        lose: 2
      },
      {
        user_id: 'qux',
        password: hashedPassword,
        avatar_id: 1,
        rate: Math.floor(Math.random() * 2000),
        win: 7,
        lose: 3
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('users', null, {})
  }
}
