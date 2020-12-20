'use strict'

const bcrypt = require('bcrypt')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = 'password'
    const hash = bcrypt.hashSync(password, 10)

    await queryInterface.bulkInsert('users', [
      {
        user_id: 'foo',
        password: hash
      },
      {
        user_id: 'bar',
        password: hash
      },
      {
        user_id: 'baz',
        password: hash
      },
      {
        user_id: 'qux',
        password: hash
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('users', null, {})
  }
}
