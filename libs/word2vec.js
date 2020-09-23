const models = require('../models');

class Word2vec {
  fetchWords() {
    models.word2vec.findAll({
      where: {
        id: 2
      }
    }).then((words) => {
      console.log(words)
    })
  }
}

module.exports = new Word2vec();
