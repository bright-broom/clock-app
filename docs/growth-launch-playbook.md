# Growth Launch Playbook

## 1) Search Console / Bing 登録

1. 本番ドメインを `NEXT_PUBLIC_SITE_URL` に設定
2. Google Search Console でドメインプロパティを追加
3. Bing Webmaster Tools でサイト追加
4. 各ツールでメタタグ検証値を取得
5. 環境変数へ設定
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - `NEXT_PUBLIC_BING_SITE_VERIFICATION`
6. `/sitemap.xml` を送信

## 2) 投稿テンプレート

### Product Hunt

- Title: Clock App - Fast multilingual online clock and world time tools
- Tagline: Real-time local clock, world clock, and UTC converter in one place
- CTA: Try it now and share your city request

### Hacker News (Show HN)

- Title: Show HN: Multilingual online clock with world clock and UTC converter
- Body:
  - Why: I wanted a clean clock app with better SEO and fast loading.
  - What: Local clock, world city pages, UTC converter, multi-language routes.
  - Tech: Next.js + next-intl + Web Vitals instrumentation.
  - Feedback request: Which city/time tools should be added next?

### Reddit (`r/webdev`, `r/productivity`)

- Post title: I built a fast multilingual world clock + UTC converter (Next.js)
- Body:
  - Live local clock and city pages
  - UTC conversion across major cities
  - Lightweight and mobile-friendly
  - Looking for feedback and feature requests

### Qiita / Zenn / Dev.to

- Suggested article sections:
  1. なぜ時計アプリを作るのか
  2. SEO設計（metadata / sitemap / hreflang / structured data）
  3. Core Web Vitals計測の実装
  4. 多言語化戦略と運用

## 3) 継続運用

- 週1回: Search Console のクエリ/掲載順位を確認
- 週1回: 新しい `time-in-city` ページを3-5本追加
- 月1回: CTR改善のため title / description を最適化
