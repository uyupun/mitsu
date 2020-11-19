'use strict'

const fs = require('fs')
const json = JSON.parse(fs.readFileSync('./word2vec/word2vec.json', 'utf-8'))

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('word2vecs', json, {})
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('word2vecs', null, {})
  }
}
