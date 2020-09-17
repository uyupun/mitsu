# PCA(主成分分析)
# 200次元のベクトルを2次元に圧縮する

from gensim.models import word2vec
from sklearn.decomposition import PCA
from janome.tokenizer import Tokenizer

import os
import pathlib
import json
import re

model = word2vec.Word2Vec.load('./model')
words = model.wv.index2word

# PCAするための前準備
# JanomeのTokenizerによって品詞分解、名詞のみを抽出している
# TODO: これを学習の段階でやりたい
vectors =[]
names = []
t = Tokenizer()
for word in words:
    tokens = t.tokenize(word)
    length = 0
    for token in tokens:
        length += 1
        if ((token.part_of_speech.split(',')[0] == '名詞') and (length == 1)):
            vectors.append(model[word])
            names.append(word)

# PCA
pca = PCA(n_components=2)
pca.fit(vectors)
vectors = pca.transform(vectors)

# JSONに書き込める形式に変換
i = 0
json_data = []
while i < len(vectors):
    json_data.append({ 'word': names[i], 'move_x': vectors[i][0], 'move_y': vectors[i][1] })
    i += 1

# JSONファイルに書き込み
file_path = pathlib.Path(os.getcwd() + '/word2vec.json')
if not file_path.exists():
    file_path.touch()
json_file = open(file_path, 'w')
json.dump(json_data, json_file, ensure_ascii=False, separators=(',', ':'))
