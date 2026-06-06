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

## 関連リポジトリ

VirBiCoin エコシステムは以下の6つのリポジトリで構成されています：

| リポジトリ | 役割 | ローカルパス | URL |
|-----------|------|-------------|-----|
| **virbicoin.com** | 公式Webサイト（メインサイト） | `../virbicoin.com` | [github.com/virbicoin/virbicoin.com](https://github.com/virbicoin/virbicoin.com) |
| **vbcstats** | ネットワーク統計ダッシュボード | `../vbcstats` | [github.com/virbicoin/vbcstats](https://github.com/virbicoin/vbcstats) |
| **vbc-explorer** | ブロックチェーンエクスプローラー | `../vbc-explorer` | [github.com/virbicoin/vbc-explorer](https://github.com/virbicoin/vbc-explorer) |
| **go-virbicoin** | メインクライアント（Gvbc, Go実装） | `../go-virbicoin` | [github.com/virbicoin/go-virbicoin](https://github.com/virbicoin/go-virbicoin) |
| **open-virbicoin-pool** ← 本リポジトリ | マイニングプール | `../open-virbicoin-pool` | [github.com/virbicoin/open-virbicoin-pool](https://github.com/virbicoin/open-virbicoin-pool) |
| **rpc.virbicoin.com** | RPCノードステータス & JSON-RPCプロキシ | `../rpc.virbicoin.com` | [github.com/virbicoin/rpc.virbicoin.com](https://github.com/virbicoin/rpc.virbicoin.com) |

### 依存関係

- **open-virbicoin-pool** → **go-virbicoin**: マイニングプールが Gvbc ノードから作業を取得・ブロック解除
- **vbcstats** → **go-virbicoin**: Gvbc ノードが eth-netstats-client プロトコルでブロック/統計データを送信
- **vbc-explorer** → **go-virbicoin**: JSON-RPC 経由でブロックチェーンデータを取得
- **rpc.virbicoin.com** → **go-virbicoin**: RPC プロキシが Gvbc ノードにリクエストを中継
