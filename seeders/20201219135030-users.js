'use strict'

const auth = require('../libs/auth')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = auth.hashPassword('password')
    await queryInterface.bulkInsert('users', [
      {
        user_id: 'foo',
        password: hashedPassword
      },
      {
        user_id: 'bar',
        password: hashedPassword
      },
      {
        user_id: 'baz',
        password: hashedPassword
      },
      {
        user_id: 'qux',
        password: hashedPassword
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('users', null, {})
  }
}
