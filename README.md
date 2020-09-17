# Mitsu

Mitsu is [SOCIAL RESISTANCE](https://github.com/uyupun/social-resistance)'s online game server.

### リンク

|||
|:--|:--|
|text8コーパス(日本語版)|https://github.com/Hironsan/ja.text8|

### 環境構築

```bash
# セットアップ(初回のみ)
$ make setup
```

### 環境構築(Word2vec)

※ ただし学習・整形済みのWord2Vecのデータが `assets/json/word2vec.json` に既にあるのでこちらの環境構築は飛ばしても構いません。  
※ このプロセスは `assets/json/word2vec.json` を新規に作成する場合と、下記のテストを行う場合に必要です。

```bash
# Python3とPipenvがインストールされている前提です
$ cd word2vec
$ make setup
```

### 開発環境

```bash
# 開発用サーバーの起動
$ yarn dev
# モデルとマイグレーションファイルの作成
$ yarn make:model --name <model_name> --attributes <field1>:<type1>,<field2>:<type2>,...
# マイグレーションの実行
$ yarn migrate
# データベースのドロップ + マイグレーションの実行
$ yarn migrate:fresh
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

### 本番環境

```bash
# 本番用サーバーの起動(バックグラウンド)
$ yarn prod:up
# 本番用サーバの情報
$ yarn prod:ls
# 本番用サーバの停止
$ yarn prod:down
```
