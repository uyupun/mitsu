# Word2vecモデルの学習

from gensim.models import word2vec

import logging

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

corpus = word2vec.Text8Corpus('./corpus')
model = word2vec.Word2Vec(corpus, size=200, min_count=20, window=15)
model.save('model')
