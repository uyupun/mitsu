'use strict'

const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = 'password'
    const round = 10
    const salt = bcrypt.genSaltSync(round)
    const hash = bcrypt.hashSync(password, salt)

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
