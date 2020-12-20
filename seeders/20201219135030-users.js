'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        user_id: 'foo',
        password: 'password'
      },
      {
        user_id: 'bar',
        password: 'password'
      },
      {
        user_id: 'baz',
        password: 'password'
      },
      {
        user_id: 'qux',
        password: 'password'
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('users', null, {})
  }
}
