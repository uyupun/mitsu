'use strict'

const auth = require('../libs/auth')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = auth.hashPassword('password')
    const rate = 1800
    await queryInterface.bulkInsert('users', [
      {
        user_id: 'foo',
        password: hashedPassword,
        avatar_type: 1,
        rate,
        win: 10,
        lose: 0
      },
      {
        user_id: 'bar',
        password: hashedPassword,
        avatar_type: 1,
        rate: rate - 200,
        win: 9,
        lose: 1
      },
      {
        user_id: 'baz',
        password: hashedPassword,
        avatar_type: 1,
        rate: rate - 400,
        win: 8,
        lose: 2
      },
      {
        user_id: 'qux',
        password: hashedPassword,
        avatar_type: 1,
        rate: rate - 600,
        win: 7,
        lose: 3
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('users', null, {})
  }
}
