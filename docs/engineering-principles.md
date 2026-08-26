# Engineering Principles

この文書は、Clock App の設計判断に使う基準です。`AGENTS.md` は実行時の行動規約、この文書は判断理由、`docs/architecture.md` は現在の構造を定義します。実際の挙動は Code と Test が正本です。

## 1. 変更理由で境界を決める

- 同じ理由・同じ頻度で変わるものをまとめます。
- 将来使うかもしれないという理由だけで共有化しません。
- Feature 固有の UI と State は Feature 内に置き、複数 Feature で実際に共有される純粋な概念だけを `lib` または `components` へ移します。
- 新しい外部 Service、永続化方式、公開 API、Security Boundary を導入する場合は ADR を作成します。

## 2. Hardcode を一律に禁止しない

禁止するのは、説明のない Magic Value、重複した設定、環境依存値の埋め込みです。

| 値の種類                    | 配置                         | 必須 Control                                           |
| --------------------------- | ---------------------------- | ------------------------------------------------------ |
| 安定した仕様・Protocol 制約 | 名前付き定数                 | 型、境界値 Test、変更理由                              |
| 環境ごとに異なる値          | Environment／Config Boundary | Build／起動時検証、Fail-closed、秘密情報を含めない Log |
| Product 管理 Data           | 型付き Data Module           | Schema、重複検査、更新 Test                            |
| Design 値                   | Semantic Design Token        | Raw Color の直接利用禁止、Visual Regression            |
| Secret                      | 承認済み Secret Manager      | Repository／Log／Fixture へ保存しない                  |
| Test 専用値                 | Test Config／Fixture         | Production 値と混同しない                              |

外部設定化は、Deploy なしで変更する明確な運用要件がある場合に限ります。設定を増やす場合は、Validation、Default、Version、Rollback、Owner も設計します。

## 3. Single Source of Truth を明示する

- State、設定、時刻、識別子ごとに Owner を 1 つ決めます。
- 派生値は正本から計算し、複数箇所で個別更新しません。
- Framework 制約で重複が避けられない場合は、同期 Test または Architecture Check を追加します。
- Browser Storage は信用できない入力として Parse／Version 管理し、UI Component から直接操作しません。

## 4. Dependency と Side Effect を閉じ込める

- 依存方向は `app -> features -> components -> lib` とします。
- Feature は別 Feature の内部実装へ依存しません。
- Network、Storage、Timer、Browser Lifecycle、Log は Boundary／Adapter に置き、純粋な Domain Logic から分離します。
- Server-safe Entry と Client-only Entry を分け、Client Bundle へ Secret や Server-only Dependency を混入させません。

## 5. Failure と Concurrency を正常系と同時に設計する

- Retry には Deadline、上限、重複時の挙動を定義します。
- Shared State には Owner、更新順序、競合解決、古い更新の扱いを定義します。
- Browser の Background Throttling、Storage 無効、Network 切断を通常の Failure Mode として扱います。
- Partial Failure 時に安全な縮退ができない処理は Fail-closed にします。

## 6. Security と Privacy は Boundary で強制する

- Client 由来の値、Browser Storage、Header、Telemetry は信用しません。
- Secret、不要な PII、Request Body 全体を Log に記録しません。
- CI Token は Read-only を既定とし、Untrusted Code と Release Credential を分離します。
- Security Control の例外は AI Agent が自己承認しません。

## 7. Evidence を同じ Revision に結び付ける

- Bug 修正には可能な限り修正前に失敗する Regression Test を追加します。
- Local、CI、Preview、Production の成功を区別します。
- Merge 対象 Commit SHA と Test 対象 SHA を一致させます。
- Coverage は補助 Signal であり、Assertion の妥当性や仕様適合性の証明にはしません。

## 8. Reversibility と運用を設計に含める

- Data／Schema／Protocol の変更には互換期間と Rollback を定義します。
- Observer、Alert、Recovery、Owner がない新しい Failure Mode を放置しません。
- 不可逆、Production、Credential、権限、外部公開の変更は Human Approval を必須とします。

## Blocking と Advisory

次は Blocking Gate です。

- Type、Lint、Format、Test、Build、Architecture Check の失敗
- Secret／PII の混入
- Dependency Direction、Client／Server Boundary、Storage Boundary の違反
- 必須 CI の Missing、Skipped、Cancelled、Timed out、Stale

次は Advisory Review です。

- 抽象化候補、命名、将来の拡張案
- 一度しか使わない値の共通化
- 実測 Evidence がない性能最適化
- Product 意味を変える可能性がある設計変更

Advisory を機械的な Error に昇格する場合は、誤検知が少なく、修正方法が明確で、Owner が定義されていることを確認します。

## Temporary Exception

Architecture Check の例外は `architecture-policy.json` に記録します。例外には Rule、完全一致の Repository 相対 Path、Reason、GitHub Owner、90 日以内の Expiry、Compensating Control が必要です。期限切れの例外は CI を失敗させます。Secret や Client／Server Boundary などの Security Rule は例外化できません。恒久的な仕様は例外ではなく、Rule または設計文書を更新します。
