# Release Gate

本番公開の判定単位は Branch 名ではなく、変更されない Commit SHA です。CI を通過していない SHA を本番へ公開しません。

## 必須 Gate

1. Pull Request で `Quality, Security, and Build` が成功している。
2. Preview で主要画面、Mobile 表示、Keyboard 操作を確認している。
3. 承認対象と CI／Preview の Commit SHA が一致している。
4. 本番反映前に Rollback 先の Commit SHA を記録している。
5. 本番反映後に主要 URL、Security Header、`sitemap.xml`、`robots.txt`、Web Vitals の受信を確認する。

## GitHub 設定

- Default Branch への直接 Push を禁止する。
- Pull Request と必須 Status Check を要求する。
- Conversation の解決と Code Owner の承認を要求する。
- 管理者による迂回を原則禁止する。

Private Repository で設定できない項目がある場合は、契約 Plan と代替統制を `要確認` とし、設定済みと扱いません。

## Hosting 設定

- Production Deployment は CI 成功後の承認操作に限定する。
- Preview で確認した Commit SHA と同じ Artifact／SHA を昇格する。
- `/api/web-vitals` は CDN／WAF で分散 Rate Limit を適用する。
- CDN／WAF の設定と動作 Evidence を確認した後に限り、Production の
  `WEB_VITALS_INGESTION_ENABLED=true` を承認する。未設定・不正値は受信を拒否する。
- Application 内の固定 Window 制限は Instance 単位の防御層であり、CDN／WAF の
  分散 Rate Limit の代替として扱わない。
- Rollback は既知の正常 Commit へ戻し、再 Deploy 後に Smoke Test を行う。

## Evidence

Release ごとに Pull Request URL、Commit SHA、CI Run URL、Preview URL、承認者、Production Deployment URL、Rollback SHA を記録します。ローカルの Build 成功だけを公開完了の Evidence にしません。
