import os
import pathlib
import json
import matplotlib.pyplot as plt
import japanize_matplotlib

file_path = pathlib.Path(os.getcwd() + '/word2vec.json')
json_file = open(file_path, 'r')
json_data = json.load(json_file)

# (x, y)のそれぞれの最大値、最小値を求める
# だいたい-15〜+15の間に収まっている
# xp = 0
# xm = 0
# yp = 0
# ym = 0
# for word in json_data:
#     if word['x'] > xp:
#         xp = word['x']
#     if word['x'] < xm:
#         xm = word['x']
#     if word['y'] > yp:
#         yp = word['y']
#     if word['y'] < ym:
#         ym = word['y']
# print(xp)
# print(xm)
# print(yp)
# print(ym)

i = 0
while i < 100:
    plt.plot(json_data[i]['x'], json_data[i]['y'], ms=5.0, zorder=2, marker='x', color='r')
    plt.annotate(json_data[i]['word'], (json_data[i]['x'], json_data[i]['y']), size=7)
    i += 1

plt.grid()
plt.show()
