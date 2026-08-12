# Clock App

Next.js製デジタル時計アプリ。

## 機能

- リアルタイム時刻表示
- 日付表示（年月日・曜日）
- 多言語対応（日本語・英語）
- アクセシビリティ対応

## 技術スタック

Next.js 14 / React 18 / TypeScript / Tailwind CSS / next-intl / Vitest

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000

### 環境変数

`.env.example` を元に `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SITE_URL`: 本番ドメイン（canonical / sitemap / robots に使用）
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`: Google Search Console 検証トークン（任意）
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`: Bing Webmaster 検証トークン（任意）

## スクリプト

| コマンド             | 説明         |
| -------------------- | ------------ |
| `npm run dev`        | 開発サーバー |
| `npm run build`      | ビルド       |
| `npm run test:run`   | テスト       |
| `npm run lint`       | Lint         |
| `npm run type-check` | 型チェック   |
| `npm run format`     | フォーマット |

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
