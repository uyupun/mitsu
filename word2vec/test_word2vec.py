# Word2vecモデルのテスト
# - 単語の分散表現(200次元)
# - 類似度が近い単語トップ10
# - ２単語間の類似度の測定

from gensim.models import word2vec

import sys

model = word2vec.Word2Vec.load('./model')

word1 = sys.argv[1] if len(sys.argv) > 1 else None
word2 = sys.argv[2] if len(sys.argv) > 2 else None

if word1:
    print('word1:')
    print('Vector(200 dimension):')
    print(model.wv[word1])
    print()

    print('Most similar(top 10):')
    words = model.most_similar(positive=word1)
    for word in words:
        print(word)
else:
    print('word1:')
    print('No resources')

print('----------------------------------------')

if word2:
    print('word2:')
    print('Vector(200 dimension):')
    print(model.wv[word2])
    print()

    print('Most similar(top 10):')
    words = model.most_similar(positive=word2)
    for word in words:
        print(word)
else:
    print('word2:')
    print('No resources')

print('----------------------------------------')

if word1 and word2:
    print('Similarity(2 words):')
    similarity = model.wv.similarity(w1=word1, w2=word2)
    print(similarity)
