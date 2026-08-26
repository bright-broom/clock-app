# Architecture

Clock App は、依存方向を明示した feature-first 構成を採用します。

```text
app  ───────────────→ features ───────────────→ components ─────→ lib
 │                         │                         │               ↑
 ├─────────────────────────┼─────────────────────────┘               │
 └─────────────────────────┴─────────────────────────────────────────┘
```

矢印の向きにのみ依存できます。下位レイヤーから上位レイヤーへの import は ESLint で拒否します。

## レイヤー責務

| ディレクトリ      | 責務                                             | 依存可能な対象                  |
| ----------------- | ------------------------------------------------ | ------------------------------- |
| `src/app/`        | Next.js のルーティング、metadata、ページ構成     | `features`、`components`、`lib` |
| `src/features/`   | ユーザー機能ごとの UI、状態、ユースケース        | 同一機能内、`components`、`lib` |
| `src/components/` | 機能に依存しない共有 UI とアプリケーションシェル | `components`、`lib`             |
| `src/lib/`        | i18n、時刻・SEO基盤、純粋関数、運用基盤          | `lib`                           |
| `src/test/`       | テスト共通基盤                                   | テストからのみ利用              |

## Feature の公開 API

各 Feature の外部公開 API は、その Feature 直下の `index.ts` に限定します。

```text
src/features/timer/
├── index.ts              # 外部公開 API
└── model/
    ├── timerMachine.ts   # 純粋な状態遷移
    └── useTimer.ts       # ブラウザ副作用のドライバー
```

- `app` からは `@/features/timer` のように公開 API を import します。
- Feature 内部では相対 import を使用します。
- Feature 間で実装ファイルを直接 import しません。共有が必要な概念は、責務を確認して `lib` または `components` へ抽出します。
- `src/lib/index.ts` は Server Component から安全に使える export のみを含めます。Client Hook は公開しません。
- Server／Client の両方を持つ共通基盤は公開口を分けます。例：`@/lib/time` は Server-safe、`@/lib/time/client` は Client 専用です。

## 変更判断

新しいコードを置く際は、次の順番で判断します。

1. 特定のユーザー機能にだけ必要なら、その `features/<feature>/` に置く。
2. 複数機能で使う表示要素なら `components/` に置く。
3. UI に依存しない共通ロジック、設定、データなら `lib/` に置く。
4. URL、metadata、ページ全体の構成に関する処理だけを `app/` に置く。

共有化は「将来使うかもしれない」ではなく、実際に複数の利用箇所が生じた時点で行います。
