# Clock App

Next.js製デジタル時計アプリ。

## 機能

- リアルタイム時刻表示
- 日付表示（年月日・曜日）
- 多言語対応（日本語・英語・ドイツ語・スペイン語・フランス語・ヒンディー語・ポルトガル語）
- アクセシビリティ対応

## 技術スタック

Next.js 16 / React 18 / TypeScript / Tailwind CSS / next-intl / Vitest

## セットアップ

```bash
nvm use
npm ci
npm run dev
```

http://localhost:3000

### 環境変数

`.env.example` を元に `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SITE_URL`: 本番ドメイン（canonical / sitemap / robots に使用）。本番ビルドでは必須
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`: Google Search Console 検証トークン（任意）
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`: Bing Webmaster 検証トークン（任意）

## スクリプト

| コマンド                | 説明                     |
| ----------------------- | ------------------------ |
| `npm run dev`           | 開発サーバー             |
| `npm run build`         | ビルド                   |
| `npm run test:run`      | テスト                   |
| `npm run test:coverage` | カバレッジ閾値付きテスト |
| `npm run lint`          | Lint                     |
| `npm run type-check`    | 型チェック               |
| `npm run format`        | フォーマット             |

## プロジェクト構造

```text
src/
├── app/[locale]/      # ルーティング
├── components/        # UIコンポーネント
│   ├── clock/
│   ├── layout/
│   └── ui/
├── lib/               # ロジック・ユーティリティ
│   ├── hooks/
│   ├── i18n/
│   ├── utils/
│   └── web-vitals/
├── test/              # テストユーティリティ
└── types/             # 型定義
```

## 開発規約

[CLAUDE.md](./CLAUDE.md) を参照。

## SEO運用チェックリスト

1. 本番で `NEXT_PUBLIC_SITE_URL` を正しいドメインへ設定
2. `https://<domain>/sitemap.xml` と `https://<domain>/robots.txt` の公開確認
3. Google Search Console にプロパティ登録して sitemap 送信
4. Bing Webmaster Tools に登録して sitemap 送信
5. Search Console の Core Web Vitals レポートを継続監視
6. 公開導線:
   - Product Hunt のローンチページ作成
   - Reddit (`r/webdev`, `r/productivity`) 投稿
   - Hacker News Show HN 投稿
   - Qiita / Zenn / Dev.to で機能紹介記事を公開

## リリース・運用チェックリスト

1. Node.js 20.19.x / npm 10.9.x と `npm ci` を使用する
2. `NEXT_PUBLIC_SITE_URL` を承認済みの本番HTTPS originへ設定する
3. Pull RequestでCIとPreview Deploymentを成功させ、画面・レスポンシブ・キーボード操作を確認する
4. `/api/web-vitals` にCDN/WAFの分散レート制限を設定する（アプリ内の同一オリジン検証だけで代替しない）
5. 構造化された `web_vital` / エラーログがホスティング基盤に取り込まれることを確認し、秘密情報や個人情報を記録しない
6. 本番反映前に変更承認とロールバック対象コミットを確認する
7. 反映後に主要URL、セキュリティヘッダー、sitemap、robots、Web Vitals受信を確認する
