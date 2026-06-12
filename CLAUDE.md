# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイドラインを提供します。

## プロジェクト概要

Open VirBiCoin Pool — VirBiCoin (VBC) ネットワーク向けのオープンソースマイニングプール。Go バックエンドと Next.js フロントエンドで構成されています。

## 技術スタック

- **バックエンド**: Go 1.22+
- **フロントエンド**: Next.js 16（App Router）, React 19, TypeScript 5
- **データストア**: Redis
- **ブロックチェーン接続**: go-virbicoin (Gvbc) JSON-RPC
- **プロトコル**: HTTP mining + Stratum

## よく使うコマンド

```bash
# バックエンドビルド
go build

# バックエンド実行
./open-virbicoin-pool config.json

# フロントエンド開発
cd www && npm run dev

# フロントエンドビルド
cd www && npm run build

# フロントエンド品質チェック
cd www && npm run check
```

## コミット署名（GPG）

このリポジトリのコミットは GPG 署名が有効です（`commit.gpgsign`）。AI エージェントは
秘密情報であるパスフレーズを代理入力できないため、gpg-agent のキャッシュが切れていると
`git commit` が署名失敗で中断することがあります。

- 署名が切れているときは、ユーザーがターミナルで一度パスフレーズを入力してください
  （`git commit` の再実行、または `echo test | gpg --clearsign` を一度実行）。一度
  入力すれば gpg-agent がしばらくキャッシュします。
- パスフレーズは秘密情報です。AI エージェントへ渡したりディスクへ保存したりしないで
  ください。
- コミット失敗を未然に防ぎたい場合は、コミット前にキャッシュを温める pre-commit フック
  （署名キャッシュが切れていればパスフレーズ入力を促す）を利用する方法があります。

## 関連リポジトリ

VirBiCoin エコシステムは以下のリポジトリで構成されています:

| リポジトリ | 役割 | ローカルパス | URL |
|-----------|------|-------------|-----|
| **virbicoin.com** | 公式 Web サイト（メインサイト） | `../virbicoin.com` | [github.com/virbicoin/virbicoin.com](https://github.com/virbicoin/virbicoin.com) |
| **go-virbicoin** | メインクライアント（Gvbc, Go 実装） | `../go-virbicoin` | [github.com/virbicoin/go-virbicoin](https://github.com/virbicoin/go-virbicoin) |
| **openvirbicoin** | Rust クライアント（Ovbc, OpenEthereum フォーク） | `../openvirbicoin` | [github.com/virbicoin/openvirbicoin](https://github.com/virbicoin/openvirbicoin) |
| **vbc-stats** | ネットワーク統計ダッシュボード | `../vbc-stats` | [github.com/virbicoin/vbc-stats](https://github.com/virbicoin/vbc-stats) |
| **vbc-explorer** | ブロックチェーンエクスプローラー | `../vbc-explorer` | [github.com/virbicoin/vbc-explorer](https://github.com/virbicoin/vbc-explorer) |
| **open-virbicoin-pool** ← 本リポジトリ | マイニングプール | `../open-virbicoin-pool` | [github.com/virbicoin/open-virbicoin-pool](https://github.com/virbicoin/open-virbicoin-pool) |
| **vbc-rpc** | RPC ノードステータス & JSON-RPC プロキシ | `../vbc-rpc` | [github.com/virbicoin/vbc-rpc](https://github.com/virbicoin/vbc-rpc) |

### 依存関係

- **openvirbicoin**: go-virbicoin（Gvbc）と同じ VirBiCoin ネットワーク（chainId 329）に接続する代替クライアント（Ovbc, Rust 実装）
- **open-virbicoin-pool** → **go-virbicoin**: マイニングプールが Gvbc ノードから作業を取得・ブロック解除
- **vbc-stats** → **go-virbicoin**: Gvbc ノードが eth-netstats-client プロトコルでブロック/統計データを送信
- **vbc-explorer** → **go-virbicoin**: JSON-RPC 経由でブロックチェーンデータを取得
- **vbc-rpc** → **go-virbicoin**: RPC プロキシが Gvbc ノードにリクエストを中継
