# Mitsu

Mitsu is [SOCIAL RESISTANCE](https://github.com/uyupun/social-resistance)'s online game server.

### コマンド

```bash
# 環境構築
$ make setup
# 開発環境のサーバとコンテナの起動
$ make up
# コンテナの停止
$ make down
# モデルとマイグレーションファイルの作成
$ yarn make:model --name <model_name> --attributes <field1>:<type1>,<field2>:<type2>,...
# シーダーファイルの作成
$ yarn make:seeder --name <seeder_name>
# Dockerのプロセス確認
$ make ps
# Expressのコンテナのシェルに入る
$ make sh
# DBにテーブル作成 + シーダーの実行
$ make db
```

### 環境構築（Word2vec）

※ ただし学習・整形済みのWord2Vecのデータは `word2vec/word2vec.json` に既にあるのでこちらの環境構築は飛ばしても構いません。  
※ このプロセスは `word2vec/word2vec.json` を作り直す場合と、次節のテストを行う場合に必要です。

```bash
# Python3とPipenvがインストールされている前提です
$ cd word2vec
$ make setup
```

### Word2vecのテスト

```bash
# 単語の分散表現(200次元)、類似度が近い単語トップ10、２単語間の類似度の測定をテストできます
$ pipenv run python3 test_word2vec.py <word1> <word2>
# 単語の分散表現(2次元)をグラフに表示する
$ pipenv run python3 test_graph.py
# ベースとなる単語を原点としたときにマイナス方向にある単語をプラス方向に変換するテスト
$ pipenv run python3 test_play.py
```

### リンク

|||
|:--|:--|
|text8コーパス(日本語版)|https://github.com/Hironsan/ja.text8|
