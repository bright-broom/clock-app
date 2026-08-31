# Clock App

黄金比を取り入れた、Next.js 製の多言語時刻ツールです。デジタル時計、タイマー、ストップウォッチ、世界時計、UTC 変換を 1 つのレスポンシブな UI で提供します。

## 主な機能

| 機能             | 内容                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| デジタル時計     | ブラウザのタイムゾーンを基準に、現在時刻と日付をリアルタイム表示                                  |
| タイマー         | 既定 15 分、1／5／15 分のプリセット、時・分・秒の直接入力、開始・一時停止・再開・リセット、完了音 |
| ストップウォッチ | 0.1 秒単位の表示、開始・一時停止・再開・リセット                                                  |
| 世界時計         | 世界の主要都市の現在時刻を一覧表示                                                                |
| UTC 変換         | 入力した UTC 日時を各都市のローカル時刻へ変換                                                     |

- 日本語、英語、スペイン語、ポルトガル語、フランス語、ドイツ語、ヒンディー語に対応
- モノクロ／CorpIT の 2 種類のカラーテーマに対応
- Desktop／Mobile のレスポンシブレイアウト
- Keyboard、Touch、Screen Reader、Reduced Motion に配慮
- 時刻表示を囲む円形 UI と、黄金比に基づく Typography／Spacing を採用

### タイマー

- 設定範囲は 0 秒から 24 時間です。0 秒では開始できません。
- `Space` で開始／一時停止／再開、`R` でリセットできます。入力欄や Button の操作中は Shortcut を発火しません。
- Client-side Route 遷移や Reload を越えて Countdown を復元し、Timer 画面を離れている間も完了判定を継続します。
- 完了音の On／Off は Browser に保存されます。複数 Tab の重複再生は Web Locks と Browser Storage で抑止しますが、両方を利用できない環境では Best Effort です。
- Browser の Autoplay Policy、Background Throttling、端末の Sleep 状態によって、完了音が再生されない、または遅れる場合があります。画面上の完了状態を正本とします。
- Countdown は端末の時刻を基準にするため、計測中に System Clock を変更すると残り時間へ影響します。精密計測用途は対象外です。

### ストップウォッチ

- 同一 Browser Runtime 内では、System Clock の変更に影響されない単調時計を使用します。
- Client-side Route 遷移後も計測を継続します。
- Full Page Reload は新しい計測 Session として扱い、表示を 0 に戻します。

### カラーテーマ

- `minimal`（モノクロ）を既定 Theme、`corpit` を追加 Theme として提供します。
- 選択内容は Browser Storage に保存し、Reload 後に復元します。
- Theme 値は型付き Allowlist で検証し、不正値や Storage 障害時は既定 Theme へ安全に戻します。
- Product UI は Semantic Color Token のみを参照し、Theme 固有色を Feature へ直接埋め込みません。

## 技術スタック

- Next.js 16 / React 18 / TypeScript 5
- Tailwind CSS 3 / next-intl
- Vitest / Testing Library / Playwright
- ESLint / Prettier / Husky

Version の正本は [`package.json`](./package.json) と [`package-lock.json`](./package-lock.json) です。

## セットアップ

### 前提環境

- Node.js 24.x
- npm 10.9.9

```bash
nvm use
npm install --global npm@10.9.9
npm --version
cp .env.example .env.local
npm ci
npm run dev
```

`npm --version` が `10.9.9` であることを確認してから `npm ci` を実行してください。開発サーバーは http://localhost:3000 で起動します。

### 環境変数

`.env.example` を元に `.env.local` を作成します。Secret や環境固有値は Repository に Commit しないでください。

| 変数                                   | 必須         | 用途                                                                               |
| -------------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | 本番では必須 | canonical、sitemap、robots に使用する承認済み HTTPS Origin                         |
| `WEB_VITALS_INGESTION_ENABLED`         | 任意         | CDN／WAF の Rate Limit 検証後にのみ本番で `true`。未設定または不正値では受信を拒否 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | 任意         | Google Search Console の検証 Token                                                 |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION`   | 任意         | Bing Webmaster Tools の検証 Token                                                  |

## 開発コマンド

| コマンド                      | 説明                                                   |
| ----------------------------- | ------------------------------------------------------ |
| `npm run dev`                 | 開発サーバーを起動                                     |
| `npm run build`               | Production Build を作成                                |
| `npm run build:verify`        | 検証用 URL で Production Build を作成                  |
| `npm run start`               | Production Server を起動                               |
| `npm run test:run`            | Unit／Component Test を実行                            |
| `npm run test:coverage`       | Coverage 閾値付き Test を実行                          |
| `npm run test:e2e`            | Chromium の Browser 回帰 Test を実行                   |
| `npm run lint`                | ESLint を実行                                          |
| `npm run type-check`          | TypeScript の型検査を実行                              |
| `npm run format:check`        | Prettier の差分を検査                                  |
| `npm run review:architecture` | 依存方向と設計 Policy を検査                           |
| `npm run verify`              | Architecture、型、Lint、Format、Test、Build を一括検証 |
| `npm run verify:ci`           | `verify` と Browser 回帰 Test を一括実行               |

Pull Request の作成前は、CI と同じ npm Version で次を実行します。

```bash
npm ci
npm run verify:ci
npm audit --audit-level=high
```

## プロジェクト構造

```text
src/
├── app/                 # Next.js Route、Metadata、API Adapter
│   ├── [locale]/        # Locale 別 Page
│   └── api/web-vitals/  # Web Vitals 受信境界
├── features/            # 機能単位の UI・状態・Use Case
│   ├── clock/
│   ├── stopwatch/
│   ├── timer/
│   ├── utc-converter/
│   └── world-clock/
├── components/          # 機能に依存しない共有 UI
│   ├── layout/
│   ├── theme/
│   └── ui/
├── lib/                 # Server-safe な共通基盤・純粋関数
│   ├── i18n/
│   ├── seo/
│   ├── time/
│   ├── utils/
│   └── web-vitals/
├── test/                # Test 共通基盤
└── types/               # Global Declaration のみ
```

依存方向は `app -> features -> components -> lib` です。Feature の外部利用者は `src/features/<feature>/index.ts` だけを公開 API として参照します。

## 設計・運用の正本

| 領域                 | Document                                                   |
| -------------------- | ---------------------------------------------------------- |
| 開発規約             | [AGENTS.md](./AGENTS.md)                                   |
| Engineering 判断基準 | [Engineering Principles](./docs/engineering-principles.md) |
| 責務と依存方向       | [Architecture](./docs/architecture.md)                     |
| 重要な設計判断       | [ADR](./docs/adr/README.md)                                |
| Release 判定         | [Release Gate](./docs/release-gate.md)                     |
| SEO／公開導線        | [Growth Launch Playbook](./docs/growth-launch-playbook.md) |

README は導入と全体像を扱います。詳細な設計・Release・Growth 手順は上記 Document を正本とし、重複して管理しません。

## 依存関係の更新方針

- `package.json` と `package-lock.json` は同じ Pull Request で更新し、`npm ci` で再現性を確認します。
- `--force` や `--legacy-peer-deps` で Peer Dependency の不整合を回避しません。
- Dependabot は毎週月曜日 09:00（JST）に確認し、開発依存関係の minor／patch Update をまとめて提案します。
- 通常の major Version Update は自動提案から除外し、互換性を確認する個別 Pull Request で扱います。
- Merge 判定は、Review 対象と同じ Commit SHA で必須 CI と Preview が成功していることを条件とします。
