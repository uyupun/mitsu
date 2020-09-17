# ベースとなる単語を原点としたときにマイナス方向にある単語をプラス方向に変換するテスト

import os
import pathlib
import json
import matplotlib.pyplot as plt
import japanize_matplotlib

file_path = pathlib.Path(os.getcwd() + '/word2vec.json')
json_file = open(file_path, 'r')
json_data = json.load(json_file)

# 家(ベースの位置)
# index: 13
print('家(ベースの位置): ', json_data[13]['x'], json_data[13]['y'])
plt.plot(json_data[13]['x'], json_data[13]['y'], ms=5.0, zorder=2, marker='x', color='r')
plt.annotate(json_data[13]['word'] + '(ベースの位置)', (json_data[13]['x'], json_data[13]['y']), size=7)

# 出身(家をベースにマイナスの位置)
# つまり、このままでは後退してしまう ≒ ゲームの仕様的にアウト
# index: 71
print('出身(家をベースにマイナスの位置): ', json_data[71]['x'], json_data[71]['y'])
plt.plot(json_data[71]['x'], json_data[71]['y'], ms=5.0, zorder=2, marker='x', color='r')
plt.annotate(json_data[71]['word'] + '(家をベースにマイナスの位置)', (json_data[71]['x'], json_data[71]['y']), size=7)

# 歳
# index: 87
print('歳: ', json_data[87]['x'], json_data[87]['y'])
plt.plot(json_data[87]['x'], json_data[87]['y'], ms=5.0, zorder=2, marker='x', color='r')
plt.annotate(json_data[87]['word'], (json_data[87]['x'], json_data[87]['y']), size=7)

# 出身(家をベースにプラスの位置)
# 家を線対称にして出身の値をプラス方向に移動する ≒ これで前進できる
# index: 71
transform_x = json_data[13]['x'] + (abs(json_data[71]['x']) - abs(json_data[13]['x']))
print('出身(家をベースにプラスの位置): ', transform_x, json_data[71]['y'])
plt.plot(transform_x, json_data[71]['y'], ms=5.0, zorder=2, marker='x', color='r')
plt.annotate(json_data[71]['word'] + '出身(家をベースにプラスの位置)', (transform_x, json_data[71]['y']), size=7)

plt.grid()
plt.show()