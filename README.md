# Mitsu

Mitsu is [SOCIAL RESISTANCE](https://github.com/uyupun/social-resistance)'s online game server.

### 環境構築

```bash
# セットアップ(初回のみ)
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

### 本番環境

```bash
# 本番用サーバーの起動(バックグラウンド)
$ yarn prod:up
# 本番用サーバの情報
$ yarn prod:ls
# 本番用サーバの停止
$ yarn prod:down
```
