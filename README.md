# Mitsu

Mitsu is [SOCIAL RESISTANCE](https://github.com/uyupun/social-resistance)'s online game server.

### リンク

|||
|:--|:--|
|text8コーパス(日本語版)|https://github.com/Hironsan/ja.text8|

### 環境構築(Express)

```bash
# セットアップ(初回のみ)
$ make setup
```

### 開発環境のコマンド

```bash
# 開発環境のサーバとコンテナの起動
$ make dev-up
# コンテナの停止
$ make dev-down
# モデルとマイグレーションファイルの作成
$ yarn make:model --name <model_name> --attributes <field1>:<type1>,<field2>:<type2>,...
# シーダーファイルの作成
$ yarn make:seeder --name <seeder_name>
```

### 本番環境のコマンド

```bash
# 本番環境のサーバ(バックグラウンド)とコンテナの起動
$ make prod-up
# 本番環境のサーバの情報
$ make prod-ls
# 本番環境のサーバの停止
$ make prod-down
```

※ その他のコマンドに関してはnpm-scriptsを参照。

### 環境構築(Word2vec)

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
