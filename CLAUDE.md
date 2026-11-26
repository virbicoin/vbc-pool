# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイドラインを提供します。

## プロジェクト概要

VBC Pool — VirBiCoin (VBC) ネットワーク向けのオープンソースマイニングプール。Go バックエンドと Next.js フロントエンドで構成されています。

## 技術スタック

- **バックエンド**: Go 1.25+（`go.mod` は `go 1.25.0` / `toolchain go1.26.4`）
- **フロントエンド**: Next.js 16（App Router）, React 19, TypeScript 5
- **データストア**: Redis
- **ブロックチェーン接続**: go-virbicoin (Gvbc) JSON-RPC
- **プロトコル**: HTTP mining + Stratum

## よく使うコマンド

```bash
# バックエンドビルド
go build

# バックエンド実行
./vbc-pool config.json

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
| **virbicoin.com** | 公式 Web サイト（メインサイト。private） | `../virbicoin.com` | [github.com/virbicoin/virbicoin.com](https://github.com/virbicoin/virbicoin.com) |
| **go-virbicoin** | メインクライアント（Gvbc, Go 実装） | `../go-virbicoin` | [github.com/virbicoin/go-virbicoin](https://github.com/virbicoin/go-virbicoin) |
| **open-virbicoin** | Rust クライアント（Ovbc, OpenEthereum フォーク） | `../open-virbicoin` | [github.com/virbicoin/open-virbicoin](https://github.com/virbicoin/open-virbicoin) |
| **vbc-explorer** | ブロックチェーンエクスプローラー（DEX・Launchpad・ブリッジ画面を含む） | `../vbc-explorer` | [github.com/virbicoin/vbc-explorer](https://github.com/virbicoin/vbc-explorer) |
| **vbc-stats** | ネットワーク統計ダッシュボード | `../vbc-stats` | [github.com/virbicoin/vbc-stats](https://github.com/virbicoin/vbc-stats) |
| **vbc-stats-api** | VBC Stats 用ノードレポーター（組み込みレポーターのない Ovbc 向け） | `../vbc-stats-api` | [github.com/virbicoin/vbc-stats-api](https://github.com/virbicoin/vbc-stats-api) |
| **vbc-pool** ← 本リポジトリ | マイニングプール | `../vbc-pool` | [github.com/virbicoin/vbc-pool](https://github.com/virbicoin/vbc-pool) |
| **vbc-rpc** | RPC ノードステータスページ（公開 RPC・WebSocket の案内） | `../vbc-rpc` | [github.com/virbicoin/vbc-rpc](https://github.com/virbicoin/vbc-rpc) |
| **vbc-hash** | Ethash アルゴリズム実装（C/Go バインディング） | `../vbc-hash` | [github.com/virbicoin/vbc-hash](https://github.com/virbicoin/vbc-hash) |

### 依存関係

- **go-virbicoin** と **open-virbicoin**: 同じ VirBiCoin ネットワーク（chainId 329）の 2 つのクライアント実装（Gvbc は Go、Ovbc は Rust）。報酬・フォークブロックなどコンセンサスに関わる変更は必ず両方に同時に入れる
- **vbc-explorer** → ノードの JSON-RPC（Gvbc / Ovbc）。内部取引の索引は Parity 形式の `trace_transaction` を使うため Ovbc が必要（本番の explorer は Ovbc の IPC ソケットを読む）
- **vbc-stats** ← Gvbc は組み込みの ethstats レポーター（`--ethstats`）で直接報告し、Ovbc は **vbc-stats-api** を介して報告する
- **vbc-pool** → ノードの JSON-RPC（Gvbc / Ovbc。本番は両方）から作業を取得し、ブロックの確定と支払いを行う。シェアの検証は `proxy/miner.go` の純 Go 実装で、vbc-hash には依存しない
- **vbc-rpc** → 各ノードの JSON-RPC（8329）に状態を問い合わせるだけ。公開 RPC（rpc.virbicoin.com）への POST は nginx がノードへ中継し、このアプリを通らない
- **vbc-hash**: このワークスペースのどのリポジトリも import していない（Gvbc は `consensus/ethash`、vbc-pool は `proxy/miner.go` の自前実装）
- **virbicoin.com**: 静的サイト（他リポジトリへのリンクのみ）
- 公開リポジトリなので、private のリポジトリはこの表に載せていない（virbicoin.com は公開 Web サイトのソースとして載せる）。公開 README からは virbicoin.com の GitHub ではなく Web サイト（https://www.virbicoin.com）にリンクする
