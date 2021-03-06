'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('word2vecs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      word: {
        allowNull: false,
        type: Sequelize.STRING
      },
      move_x: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      move_y: {
        allowNull: false,
        type: Sequelize.DOUBLE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('word2vecs')
  }
}
